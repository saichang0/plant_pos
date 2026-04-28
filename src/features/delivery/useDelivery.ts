"use client";

import { useState, useEffect, useCallback } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { GET_DELIVERIES_QUERY } from "@/src/apollo/delivery/query";
import { UPDATE_DELIVERY_MUTATION } from "@/src/apollo/delivery/mutation";
import type { SaleRecord } from "@/src/features/sale/useSale";

// ─── Types ───────────────────────────────────────────────────
// Backend status is a GraphQL enum; values come back as uppercase strings.
export type DeliveryStatus =
  | "PACKING"
  | "SHIPPING"
  | "SHIPPED"
  | "DELIVERED";

export interface DeliveryRecord {
  id: string;
  deliveryService: string;
  branch?: string | null;
  trackingNumber?: string | null;
  status: DeliveryStatus | string; // tolerate legacy rows during migration
  shippedAt?: string | null;
  sale: SaleRecord;
}

// Coerce anything (lowercase, mixed case) into the enum value the API expects.
const VALID_DELIVERY_STATUSES: readonly DeliveryStatus[] = [
  "PACKING",
  "SHIPPING",
  "SHIPPED",
  "DELIVERED",
];
function toDeliveryEnum(s: string | undefined | null): DeliveryStatus | null {
  if (!s) return null;
  const u = s.trim().toUpperCase();
  return (VALID_DELIVERY_STATUSES as readonly string[]).includes(u)
    ? (u as DeliveryStatus)
    : null;
}

export interface DeliveryFilter {
  saleStatus?: string;
  deliveryStatus?: string;
}

// ─── Hook: list deliveries (owner-scoped on the server) ──────
export function useDeliveries(initialFilter: DeliveryFilter = {}) {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async (filter: DeliveryFilter = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await gqlFetch(GET_DELIVERIES_QUERY, {
        saleStatus: filter.saleStatus || undefined,
        deliveryStatus: filter.deliveryStatus || undefined,
      });

      if (result.errors) {
        setError(result.errors[0].message);
        return;
      }

      const data = result.data?.getDeliveries;
      if (data?.status) {
        setDeliveries(data.deliveries || []);
        setTotal(data.total || 0);
      } else {
        setError(data?.message || "Failed to fetch deliveries");
      }
    } catch (err) {
      setError("Failed to fetch deliveries");
      console.error("Error fetching deliveries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries(initialFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDeliveries]);

  return { deliveries, total, loading, error, refetch: fetchDeliveries };
}

// ─── Hook: update a delivery (status, tracking number, etc.) ──
export function useUpdateDelivery() {
  const [updating, setUpdating] = useState(false);

  const updateDelivery = async (
    id: string,
    data: { status?: DeliveryStatus | string; trackingNumber?: string }
  ): Promise<{ success: boolean; message: string; delivery?: DeliveryRecord }> => {
    setUpdating(true);
    try {
      // Status is a GraphQL enum on the server — must be uppercase.
      // Coerce here so callers can pass "shipped" or "SHIPPED" interchangeably.
      const updateData: { status?: DeliveryStatus; trackingNumber?: string } = {};
      if (data.status !== undefined) {
        const enumValue = toDeliveryEnum(data.status);
        if (!enumValue) {
          return {
            success: false,
            message: `Invalid status "${data.status}". Use one of ${VALID_DELIVERY_STATUSES.join(", ")}.`,
          };
        }
        updateData.status = enumValue;
      }
      if (data.trackingNumber !== undefined) {
        updateData.trackingNumber = data.trackingNumber;
      }

      const result = await gqlFetch(UPDATE_DELIVERY_MUTATION, {
        input: { id, data: updateData },
      });

      if (result.errors) {
        return { success: false, message: result.errors[0].message };
      }

      const payload = result.data?.updateDelivery;
      if (payload?.status) {
        return {
          success: true,
          message: payload.message || "Updated",
          delivery: payload.delivery,
        };
      }
      return {
        success: false,
        message: payload?.message || "Failed to update delivery",
      };
    } catch {
      return { success: false, message: "Something went wrong" };
    } finally {
      setUpdating(false);
    }
  };

  return { updating, updateDelivery };
}
