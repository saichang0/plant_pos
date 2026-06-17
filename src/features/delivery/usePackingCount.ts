"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { gql } from "graphql-request";

/// Lightweight query — only fetches what's needed to count deliveries that are
/// still waiting to be shipped (status PACKING). These are confirmed orders
/// that have not yet been handed to the courier.
const COUNT_PACKING_QUERY = gql`
  query CountPackingDeliveries {
    getDeliveries(saleStatus: "confirmed") {
      status
      deliveries {
        id
        status
      }
    }
  }
`;

/// Event name other components can dispatch to force an immediate recount,
/// e.g. right after confirming an order or starting a shipment — so the
/// sidebar badge updates instantly instead of waiting for the next poll.
export const DELIVERY_COUNT_REFRESH_EVENT = "delivery-count:refresh";

/// Fire this from anywhere to ask the sidebar badge to recount now.
export function refreshDeliveryCount() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DELIVERY_COUNT_REFRESH_EVENT));
  }
}

/// Counts deliveries still in PACKING (confirmed orders awaiting shipment).
/// Polls every [intervalMs] (default 20s) and also recounts on demand when
/// [DELIVERY_COUNT_REFRESH_EVENT] is dispatched. Returns 0 while loading/error.
export function usePackingDeliveryCount(intervalMs = 20_000) {
  const [count, setCount] = useState(0);
  const lastCount = useRef(0);
  const [didIncrease, setDidIncrease] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const result = await gqlFetch(COUNT_PACKING_QUERY);
      if (result.errors) return;
      const payload = result.data?.getDeliveries;
      if (!payload?.status) return;
      const deliveries: { id: string; status?: string }[] =
        payload.deliveries || [];
      const next = deliveries.filter(
        (d) => (d.status || "").toUpperCase() === "PACKING",
      ).length;
      if (next > lastCount.current) {
        setDidIncrease(true);
        // Reset the "new" pulse after a few seconds.
        setTimeout(() => setDidIncrease(false), 5_000);
      }
      lastCount.current = next;
      setCount(next);
    } catch {
      // swallow — sidebar should never throw
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const id = window.setInterval(fetchCount, intervalMs);
    window.addEventListener(DELIVERY_COUNT_REFRESH_EVENT, fetchCount);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(DELIVERY_COUNT_REFRESH_EVENT, fetchCount);
    };
  }, [fetchCount, intervalMs]);

  return { count, didIncrease, refetch: fetchCount };
}
