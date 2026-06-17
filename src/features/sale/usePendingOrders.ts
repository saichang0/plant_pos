"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gqlFetch } from "@/src/lib/gqlFetch";
import { gql } from "graphql-request";

/// Lightweight query — only fetches what's needed to count pending orders.
const COUNT_PENDING_QUERY = gql`
  query CountPendingOrders {
    getSales(status: "pending", limit: 200) {
      status
      total
      sales {
        id
        source
      }
    }
  }
`;

/// Event name other components can dispatch to force an immediate recount,
/// e.g. right after confirming or cancelling an order — so the sidebar badge
/// updates instantly instead of waiting for the next poll.
export const PENDING_COUNT_REFRESH_EVENT = "pending-count:refresh";

/// Fire this from anywhere to ask the sidebar badge to recount now.
export function refreshPendingOrderCount() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PENDING_COUNT_REFRESH_EVENT));
  }
}

/// Counts pending orders that arrived from the mobile app (PLENT_APP).
/// Polls every [intervalMs] (default 20s). Returns 0 while loading or on error.
export function usePendingOrderCount(intervalMs = 20_000) {
  const [count, setCount] = useState(0);
  const lastCount = useRef(0);
  const [didIncrease, setDidIncrease] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const result = await gqlFetch(COUNT_PENDING_QUERY);
      if (result.errors) return;
      const payload = result.data?.getSales;
      if (!payload?.status) return;
      // Only count orders that came from the mobile customer app.
      const sales: { id: string; source?: string }[] = payload.sales || [];
      const next = sales.filter((s) => s.source === "PLENT_APP").length;
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
    window.addEventListener(PENDING_COUNT_REFRESH_EVENT, fetchCount);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(PENDING_COUNT_REFRESH_EVENT, fetchCount);
    };
  }, [fetchCount, intervalMs]);

  return { count, didIncrease, refetch: fetchCount };
}
