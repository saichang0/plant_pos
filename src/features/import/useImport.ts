"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URLS } from "@/src/lib/config";
import { GET_PURCHASE_ORDERS_QUERY, GET_IMPORTS_QUERY } from "@/src/apollo/import/query";
import { CREATE_PURCHASE_ORDER_MUTATION, CONFIRM_PURCHASE_ORDER_MUTATION } from "@/src/apollo/import/mutation";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Types
export interface Supplier {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export interface PurchaseOrderDetail {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    salePrice: number;
    costPrice: number;
  };
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  userId: string;
  orderDate: string;
  totalPrice: number;
  status: string;
  supplier: Supplier | null;
  user: { id: string; firstName: string; lastName: string } | null;
  purchaseOrderDetails: PurchaseOrderDetail[];
  stockReceptions: { id: string; receptionDate: string; totalActualPrice: number }[];
}

export interface ImportDetail {
  id: string;
  receptionId: string;
  productId: string;
  quantityReceived: number;
  actualCostPrice: number;
  status: string;
  product: { id: string; name: string; imageUrl?: string; salePrice?: number } | null;
}

export interface Import {
  id: string;
  purchaseOrderId: string | null;
  userId: string;
  receptionDate: string;
  totalActualPrice: number;
  purchaseOrder: {
    id: string;
    supplierId: string;
    orderDate: string;
    totalPrice: number;
    status: string;
    supplier: { id: string; name: string } | null;
  } | null;
  user: { id: string; firstName: string; lastName: string } | null;
  stockReceptionDetails: ImportDetail[];
}

// Hook for fetching purchase orders
export function usePurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ query: GET_PURCHASE_ORDERS_QUERY }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.getPurchaseOrders;
      if (data?.status) {
        setPurchaseOrders(data.purchaseOrders || []);
      } else {
        setError(data?.message || "Failed to fetch purchase orders");
      }
    } catch {
      setError("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  return { purchaseOrders, loading, error, refetch: fetchPurchaseOrders };
}

// Hook for fetching imports (stock receptions)
export function useImports() {
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ query: GET_IMPORTS_QUERY }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.getStockReceptions;
      if (data?.status) {
        setImports(data.stockReceptions || []);
      } else {
        setError(data?.message || "Failed to fetch imports");
      }
    } catch {
      setError("Failed to fetch imports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports]);

  return { imports, loading, error, refetch: fetchImports };
}

// Hook for creating a purchase order with details
export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  costPrice: number;
}

export function useCreatePurchaseOrder() {
  const [submitting, setSubmitting] = useState(false);

  const createPurchaseOrder = async (
    supplierId: string,
    items: PurchaseOrderItem[]
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query: CREATE_PURCHASE_ORDER_MUTATION,
          variables: {
            input: {
              supplierId,
              items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                costPrice: item.costPrice,
              })),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.createPurchaseOrder;
      if (data?.status) {
        return {
          success: true,
          message: data.message || "Purchase order created successfully!",
        };
      }

      return {
        success: false,
        message: data?.message || "Failed to create purchase order",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, createPurchaseOrder };
}

// Hook for confirming a purchase order (create stock reception + details)
export interface ConfirmItem {
  productId: string;
  quantityReceived: number;
  actualCostPrice: number;
  status: 'received' | 'rejected';
}

export function useConfirmPurchaseOrder() {
  const [submitting, setSubmitting] = useState(false);

  const confirmPurchaseOrder = async (
    purchaseOrderId: string,
    items: ConfirmItem[]
  ): Promise<{ success: boolean; message: string }> => {
    setSubmitting(true);

    try {
      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          query: CONFIRM_PURCHASE_ORDER_MUTATION,
          variables: {
            input: {
              purchaseOrderId,
              items: items.map((item) => ({
                productId: item.productId,
                quantityReceived: item.quantityReceived,
                actualCostPrice: item.actualCostPrice,
                status: item.status,
              })),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const data = result.data?.confirmPurchaseOrder;
      if (data?.status) {
        return {
          success: true,
          message: data.message || "Purchase order confirmed successfully!",
        };
      }

      return {
        success: false,
        message: data?.message || "Failed to confirm purchase order",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, confirmPurchaseOrder };
}
