"use client";

import { useCallback, useEffect, useState } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import {
  SALES_HISTORY_QUERY,
  STOCK_MOVEMENTS_QUERY,
} from "@/src/apollo/history/query";
import type { SaleRecord } from "@/src/features/sale/useSale";

export type StockMovement = {
  id: string;
  productId: string;
  userId: string;
  change: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  note?: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export type HistoryFilter = {
  from?: string;
  to?: string;
  productId?: string;
  reason?: string;
  limit?: number;
  offset?: number;
};

export function useStockMovements(initial?: HistoryFilter) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>(initial || {});

  const fetchMovements = useCallback(async (f: HistoryFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gqlFetch(STOCK_MOVEMENTS_QUERY, { filter: f });
      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }
      const payload = result.data?.stockMovements;
      if (payload?.status) {
        setMovements(payload.data || []);
        setTotal(payload.total || 0);
      } else {
        setError(payload?.message || "Failed to fetch movements");
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch movements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements(filter);
  }, [filter, fetchMovements]);

  return {
    movements,
    total,
    loading,
    error,
    filter,
    setFilter,
    refetch: () => fetchMovements(filter),
  };
}

export function useSalesHistory(initial?: HistoryFilter, status?: string) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>(initial || {});
  const [statusFilter, setStatusFilter] = useState<string | undefined>(status);

  const fetchSales = useCallback(
    async (f: HistoryFilter, s?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await gqlFetch(SALES_HISTORY_QUERY, {
          filter: f,
          status: s,
        });
        if (result.errors) {
          setError(result.errors[0].message);
          return;
        }
        const payload = result.data?.salesHistory;
        if (payload?.status) {
          setSales(payload.sales || []);
          setTotal(payload.total || 0);
        } else {
          setError(payload?.message || "Failed to fetch sales history");
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch sales history");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSales(filter, statusFilter);
  }, [filter, statusFilter, fetchSales]);

  return {
    sales,
    total,
    loading,
    error,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    refetch: () => fetchSales(filter, statusFilter),
  };
}
