"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_SUPPLIERS_QUERY } from "@/src/apollo/supplier/query";
import {
  CREATE_SUPPLIER_MUTATION,
  UPDATE_SUPPLIER_MUTATION,
  DELETE_SUPPLIER_MUTATION,
} from "@/src/apollo/supplier/mutation";

export interface Supplier {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; firstName: string; lastName: string } | null;
}

export interface SupplierFormData {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const initialFormData: SupplierFormData = {
  name: "",
  phoneNumber: "",
  email: "",
  address: "",
};

// Hook for fetching suppliers list
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await gqlFetch(GET_SUPPLIERS_QUERY);

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.getSuppliers;
      if (data?.status) {
        setSuppliers(data.suppliers || []);
      } else {
        setError(data?.message || "Failed to fetch suppliers");
      }
    } catch (err) {
      setError("Failed to fetch suppliers");
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { suppliers, loading, error, refetch: fetchSuppliers };
}

// Hook for creating a supplier
export function useCreateSupplier() {
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => setFormData(initialFormData);

  const createSupplier = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(CREATE_SUPPLIER_MUTATION, {
            input: {
              name: formData.name,
              phoneNumber: formData.phoneNumber,
              email: formData.email,
              address: formData.address,
            },
          });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.createSupplier;
      if (data?.status) {
        resetForm();
        return {
          success: true,
          message: data.message || "Supplier created successfully!",
        };
      }

      return {
        success: false,
        message: data?.message || "Failed to create supplier",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { formData, setFormData, submitting, createSupplier, resetForm };
}

// Hook for updating a supplier
export function useUpdateSupplier() {
  const [submitting, setSubmitting] = useState(false);

  const updateSupplier = async (
    id: string,
    data: SupplierFormData
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(UPDATE_SUPPLIER_MUTATION, {
            input: {
              id,
              data: {
                name: data.name,
                phoneNumber: data.phoneNumber,
                email: data.email,
                address: data.address,
              },
            },
          });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const res = result.data?.updateSupplier;
      if (res?.status) {
        return {
          success: true,
          message: res.message || "Supplier updated successfully!",
        };
      }

      return {
        success: false,
        message: res?.message || "Failed to update supplier",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, updateSupplier };
}

// Hook for deleting a supplier
export function useDeleteSupplier() {
  const [submitting, setSubmitting] = useState(false);

  const deleteSupplier = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(DELETE_SUPPLIER_MUTATION, {
            input: { id },
          });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const res = result.data?.deleteSupplier;
      if (res?.status) {
        return {
          success: true,
          message: res.message || "Supplier deleted successfully!",
        };
      }

      return {
        success: false,
        message: res?.message || "Failed to delete supplier",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, deleteSupplier };
}
