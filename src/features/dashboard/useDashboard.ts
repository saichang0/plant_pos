"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URLS } from "@/src/lib/config";
import { GET_DASHBOARD_QUERY } from "@/src/apollo/dashboard/query";

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DailyStat {
  date: string;
  totalSales: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardData {
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  weekOrders: number;
  monthSales: number;
  monthOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingPurchaseOrders: number;
  dailyStats: DailyStat[];
  weeklyStats: DailyStat[];
  topProducts: TopProduct[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(BACKEND_URLS.local, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ query: GET_DASHBOARD_QUERY }),
      });

      const result = await response.json();

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const res = result.data?.getDashboard;
      if (res?.status) {
        setData(res.data);
      } else {
        setError(res?.message || "Failed to fetch dashboard");
      }
    } catch {
      setError("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
