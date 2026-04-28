"use client";

import { useState, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_REPORT_QUERY } from "@/src/apollo/report/query";

export interface ProfitReport {
  grossRevenue: number;
  totalCost: number;
  netProfit: number;
  totalOrders: number;
  profitMargin: number;
}

export interface TopSellingProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  categoryName: string;
  unitName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  percentage: number;
}

export interface PaymentBreakdown {
  paymentMethod: string;
  currency: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface OrderStatusSummary {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ReceiptItem {
  productName: string;
  quantity: number;
  unitName: string | null;
  weightGrams: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  saleId: string;
  saleDate: string;
  customerName: string | null;
  staffName: string | null;
  items: ReceiptItem[];
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  payments: { method: string; currency: string; amount: number }[];
}

export interface ReportData {
  profit: ProfitReport;
  topProducts: TopSellingProduct[];
  salesByCategory: SalesByCategory[];
  paymentBreakdown: PaymentBreakdown[];
  orderStatus: OrderStatusSummary[];
  receipts: Receipt[];
}


export function useReport() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await gqlFetch(GET_REPORT_QUERY, { startDate, endDate });

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const reportData = result.data?.getReport;
      if (reportData?.status) {
        setData(reportData.data);
      } else {
        setError(reportData?.message || "Failed to fetch report");
      }
    } catch {
      setError("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchReport };
}
