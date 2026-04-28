"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_CATEGORIES_QUERY } from "@/src/apollo/category/query";
import {
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
} from "@/src/apollo/category/mutation";

// ─── Types ───────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  createdBy?: string;
  createdAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  products?: { id: string }[];
}

export interface CategoryFormData {
  name: string;
}


// ─── Hook: Fetch all categories ──────────────────────────────
export function useCategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlFetch(GET_CATEGORIES_QUERY);
      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }
      const data = result.data?.getCategories;
      if (data?.status) {
        setCategories(data.categories || []);
      } else {
        setError(data?.message || "Failed to fetch categories");
      }
    } catch {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// ─── Hook: Create category ───────────────────────────────────
export function useCreateCategory() {
  const [submitting, setSubmitting] = useState(false);

  const createCategory = async (
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(CREATE_CATEGORY_MUTATION, {
        input: { name },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.createCategory;
      if (data?.status) {
        return { success: true, message: data.message || "Created!" };
      }
      return { success: false, message: data?.message || "Failed" };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createCategory };
}

// ─── Hook: Update category ───────────────────────────────────
export function useUpdateCategory() {
  const [submitting, setSubmitting] = useState(false);

  const updateCategory = async (
    id: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(UPDATE_CATEGORY_MUTATION, {
        input: { id, data: { name } },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.updateCategory;
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

  return { submitting, updateCategory };
}

// ─── Hook: Delete category ───────────────────────────────────
export function useDeleteCategory() {
  const [submitting, setSubmitting] = useState(false);

  const deleteCategory = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);
    try {
      const result = await gqlFetch(DELETE_CATEGORY_MUTATION, {
        input: { id },
      });
      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }
      const data = result.data?.deleteCategory;
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

  return { submitting, deleteCategory };
}
