"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/src/lib/config";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { CREATE_PRODUCT_MUTATION, UPDATE_PRODUCT_MUTATION, DELETE_PRODUCT_MUTATION } from "@/src/apollo/product/mutation";
import { GET_PRODUCTS_QUERY, GET_PRODUCT_QUERY } from "@/src/apollo/product/query";
import { GET_CATEGORIES_QUERY } from "@/src/apollo/category/query";
import { Category } from "@/src/types/auth";

export interface Product {
  id: string;
  categoryId: string;
  category: { id: string; name: string } | null;
  name: string;
  imageUrl: string | null;
  description: string;
  size: string;
  ageMonths: number;
  unit: { id: string; name: string; weightInGrams: number | null } | null;
  weightPerUnit: number | null;
  stockQuantity: number;
  stockWeight: number;
  costPrice: number;
  salePrice: number;
  pricePerHalfBag: number | null;
  pricePer12Kg: number | null;
  pricePerKg: number | null;
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
  unit: string;
  weightPerUnit: number;
  ageMonths: number;
  stockQuantity: number;
  costPrice: number;
  salePrice: number;
  pricePerHalfBag: number;
  pricePer12Kg: number;
  pricePerKg: number;
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
  unit: "",
  weightPerUnit: 0,
  ageMonths: 0,
  stockQuantity: 0,
  costPrice: 0,
  salePrice: 0,
  pricePerHalfBag: 0,
  pricePer12Kg: 0,
  pricePerKg: 0,
  discount: 0,
  isSpecialOffer: false,
  isActive: true,
  isFavorite: false,
  isPopular: false,
  imageFile: null,
};

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
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
        const result = await gqlFetch(GET_PRODUCTS_QUERY, {
              keyword: options?.keyword || undefined,
              paginate: {
                page: options?.page || 1,
                limit: options?.limit || 100,
              },
              filter: options?.filter || undefined,
            });

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
        const data = await gqlFetch(GET_CATEGORIES_QUERY);

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
        unitId: formData.unit || undefined,
        weightPerUnit: (Number(formData.weightPerUnit) || 0) * 1000 || undefined,
        ageMonths: Number(formData.ageMonths) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        stockWeight: (Number(formData.weightPerUnit) || 0) * 1000 * (Number(formData.stockQuantity) || 0),
        costPrice: Number(formData.costPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        pricePerHalfBag: Number(formData.pricePerHalfBag) || undefined,
        pricePer12Kg: Number(formData.pricePer12Kg) || undefined,
        pricePerKg: Number(formData.pricePerKg) || undefined,
        discount: Number(formData.discount) || 0,
        isSpecialOffer: formData.isSpecialOffer,
        isActive: formData.isActive,
      };

      const result = await gqlFetch(CREATE_PRODUCT_MUTATION, { input: productInput });

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

// Hook for fetching a single product by ID
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const result = await gqlFetch(GET_PRODUCT_QUERY, { where: { id } });

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.product;
      if (data?.status) {
        setProduct(data.data || null);
      } else {
        setError(data?.message || "Failed to fetch product");
      }
    } catch {
      setError("Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

// Hook for updating a product
export function useUpdateProduct() {
  const [submitting, setSubmitting] = useState(false);

  const updateProduct = async (
    id: string,
    input: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(UPDATE_PRODUCT_MUTATION, { id, input });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.updateProduct;
      if (data?.status) {
        return { success: true, message: data.message || "Updated!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, updateProduct };
}

// Hook for deleting a product
export function useDeleteProduct() {
  const [submitting, setSubmitting] = useState(false);

  const deleteProduct = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(DELETE_PRODUCT_MUTATION, { id });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.deleteProduct;
      if (data?.status) {
        return { success: true, message: data.message || "Deleted!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, deleteProduct };
}
