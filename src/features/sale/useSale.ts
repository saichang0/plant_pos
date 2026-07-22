"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_SALES_QUERY } from "@/src/apollo/sale/query";
import {
  CREATE_FULL_SALE_MUTATION,
  UPDATE_SALE_MUTATION,
} from "@/src/apollo/sale/mutation";

// ─── Types ───────────────────────────────────────────────────
export interface SaleProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  unit: { id: string; name: string } | null;
}

export interface SaleDetailItem {
  id: string;
  productId: string;
  quantity: number;
  unit: { id: string; name: string } | null;
  weightGrams: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  product: SaleProduct;
}

export interface SalePayment {
  id: string;
  paymentMethod: string;
  currency: string;
  amount: number;
  slipImageUrl?: string | null;
  paidAt: string;
}

export interface SaleDelivery {
  id: string;
  deliveryService: string;
  branch?: string | null;
  trackingNumber?: string | null;
  status: string;
  shippedAt?: string | null;
}

export interface SaleRecord {
  id: string;
  code?: string;
  source?: 'PLENT_WEB' | 'PLENT_APP';
  customerId?: string;
  userId: string;
  saleDate: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  status: string;
  customerName?: string;
  note?: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    profileImageUrl?: string;
    address?: string;
  };
  customerAddress?: {
    id: string;
    province: string;
    district: string;
    village: string;
    country: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  saleDetails: SaleDetailItem[];
  payments: SalePayment[];
  deliveries?: SaleDelivery[];
}

export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string | null;
  unit: string;
  categoryName: string;
  quantity: number;
  weightGrams: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  // For display
  salePrice: number;
  pricePerKg?: number;
}

export interface CreateSaleInput {
  customerId?: string;
  userId: string;
  customerName?: string;
  note?: string;
  taxAmount?: number;
  discountAmount?: number;
  status?: string;
  items: {
    productId: string;
    quantity: number;
    unit: string;
    unitId?: string;
    weightGrams?: number;
    unitPrice: number;
    totalPrice: number;
    note?: string;
  }[];
  payments?: {
    paymentMethod: string;
    currency: string;
    amount: number;
  }[];
}

// ─── Hook: Fetch sales list ──────────────────────────────────
export function useSales() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(
    async (options?: { status?: string; source?: 'PLENT_WEB' | 'PLENT_APP'; limit?: number; offset?: number }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await gqlFetch(GET_SALES_QUERY, {
              status: options?.status || undefined,
              source: options?.source || undefined,
              limit: options?.limit || 50,
              offset: options?.offset || 0,
            });

        if (result.errors) {
          setError(result.errors[0].message);
          return;
        }

        const data = result.data?.getSales;
        if (data?.status) {
          setSales(data.sales || []);
          setTotal(data.total || 0);
        } else {
          setError(data?.message || "Failed to fetch sales");
        }
      } catch (err) {
        setError("Failed to fetch sales");
        console.error("Error fetching sales:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, total, loading, error, refetch: fetchSales };
}

// ─── Hook: Create a full sale ────────────────────────────────
export function useCreateSale() {
  const [submitting, setSubmitting] = useState(false);

  const createSale = async (
    input: CreateSaleInput
  ): Promise<{ success: boolean; message: string; sale?: SaleRecord }> => {
    setSubmitting(true);

    try {
      const result = await gqlFetch(CREATE_FULL_SALE_MUTATION, { input });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.createFullSale;
      if (data?.status) {
        return {
          success: true,
          message: data.message || "Sale completed!",
          sale: data.sale,
        };
      }

      return {
        success: false,
        message: data?.message || "Failed to create sale",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createSale };
}

// ─── Hook: Update a sale's status (confirm / cancel / etc.) ──
export function useUpdateSaleStatus() {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (
    id: string,
    status: string
  ): Promise<{ success: boolean; message: string }> => {
    setUpdating(true);

    try {
      const result = await gqlFetch(UPDATE_SALE_MUTATION, {
        input: { id, data: { status } },
      });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.updateSale;
      if (data?.status) {
        return { success: true, message: data.message || "Updated" };
      }

      return {
        success: false,
        message: data?.message || "Failed to update status",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setUpdating(false);
    }
  };

  return { updating, updateStatus };
}
