"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URLS } from "@/src/lib/config";
import { CREATE_PRODUCT_MUTATION } from "@/src/apollo/product/mutation";
import { GET_PRODUCTS_QUERY } from "@/src/apollo/product/query";
import { GET_CATEGORIES_QUERY } from "@/src/apollo/category/query";
import { Category } from "@/src/types/auth";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  imageUrl: string | null;
  description: string;
  size: string;
  ageMonths: number;
  stockQuantity: number;
  costPrice: number;
  salePrice: number;
  isPopular: boolean;
  isSpecialOffer: boolean;
  discount: number;
  isActive: boolean;
  createdBy: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  imageUrl: string;
  description: string;
  size: string;
  ageMonths: number;
  stockQuantity: number;
  costPrice: number;
  salePrice: number;
  discount: number;
  isSpecialOffer: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isPopular: boolean;
  imageFile: File | null;
}

const initialFormData: ProductFormData = {
  name: "",
  categoryId: "",
  imageUrl: "",
  description: "",
  size: "",
  ageMonths: 0,
  stockQuantity: 0,
  costPrice: 0,
  salePrice: 0,
  discount: 0,
  isSpecialOffer: false,
  isActive: true,
  isFavorite: false,
  isPopular: false,
  imageFile: null,
};

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = BACKEND_URLS.local.replace("/graphql", "");
  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: {
      ...(typeof window !== "undefined" && localStorage.getItem("accessToken")
        ? {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          }
        : {}),
    },
    body: formData,
  });

  const result = await response.json();

  if (result.data?.url) return result.data.url;
  if (result.url) return result.url;
  if (typeof result === "string") return result;
  throw new Error(result.message || "No image URL returned");
}

// Hook for fetching products list
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (options?: {
      keyword?: string;
      page?: number;
      limit?: number;
      filter?: { isSpecialOffer?: boolean; isPopular?: boolean };
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(BACKEND_URLS.local, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            query: GET_PRODUCTS_QUERY,
            variables: {
              keyword: options?.keyword || undefined,
              paginate: {
                page: options?.page || 1,
                limit: options?.limit || 50,
              },
              filter: options?.filter || undefined,
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          setError(result.errors[0].message);
          return;
        }

        const data = result.data?.products;
        if (data?.status) {
          setProducts(data.data || []);
          setTotal(data.total || 0);
        } else {
          setError(data?.message || "Failed to fetch products");
        }
      } catch (err) {
        setError("Failed to fetch products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, loading, error, refetch: fetchProducts };
}

// Hook for fetching categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(BACKEND_URLS.local, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ query: GET_CATEGORIES_QUERY }),
        });

        const data = await response.json();

        if (data.errors) {
          setError(data.errors[0].message);
        } else {
          setCategories(data.data?.getCategories?.categories || []);
        }
      } catch {
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Hook for creating a product
export function useCreateProduct() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => setFormData(initialFormData);

  const createProduct = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      if (formData.imageFile) {
        try {
          imageUrl = await uploadImage(formData.imageFile);
        } catch {
          return { success: false, message: "Error uploading image. Please try again." };
        }
      } else {
        imageUrl = "";
      }

      const productInput = {
        name: formData.name,
        categoryId: formData.categoryId,
        imageUrl,
        description: formData.description,
        size: formData.size,
        ageMonths: Number(formData.ageMonths) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        costPrice: Number(formData.costPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        discount: Number(formData.discount) || 0,
        isSpecialOffer: formData.isSpecialOffer,
        isActive: formData.isActive,
      };

      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query: CREATE_PRODUCT_MUTATION,
          variables: { input: productInput },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const createProductResult = result.data?.createProduct;
      if (createProductResult?.status) {
        resetForm();
        return {
          success: true,
          message: createProductResult.message || "Product created successfully!",
        };
      }

      return {
        success: false,
        message: createProductResult?.message || "Failed to create product",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { formData, setFormData, submitting, createProduct, resetForm };
}
