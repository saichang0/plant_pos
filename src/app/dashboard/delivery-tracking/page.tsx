"use client";

import React from "react";
import {
  useDeliveries,
  useUpdateDelivery,
  type DeliveryRecord,
} from "@/src/features/delivery/useDelivery";

type DeliveryStatus = "PACKING" | "SHIPPING" | "DELIVERED";

const STATUS_META: Record<DeliveryStatus, { label: string; badge: string }> = {
  PACKING: { label: "ກຳລັງຫໍ່", badge: "bg-orange-100 text-orange-700" },
  SHIPPING: { label: "ກຳລັງຈັດສົ່ງ", badge: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "ສົ່ງສຳເລັດ", badge: "bg-teal-100 text-teal-700" },
};

const STATUS_ORDER: DeliveryStatus[] = ["PACKING", "SHIPPING", "DELIVERED"];

const normalizeStatus = (s: string): DeliveryStatus | null => {
  const u = s?.toUpperCase();
  return u in STATUS_META ? (u as DeliveryStatus) : null;
};

const statusLabel = (s: string) =>
  normalizeStatus(s) ? STATUS_META[normalizeStatus(s)!].label : s;

const statusBadge = (s: string) =>
  normalizeStatus(s)
    ? STATUS_META[normalizeStatus(s)!].badge
    : "bg-gray-100 text-gray-700";

function formatDate(value: string | number | Date | undefined | null) {
  if (!value) return "-";
  const d = new Date(
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value
  );
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );

function customerName(d: DeliveryRecord) {
  if (d.sale?.customer) {
    const n = `${d.sale.customer.firstName ?? ""} ${
      d.sale.customer.lastName ?? ""
    }`.trim();
    if (n) return n;
  }
  return d.sale?.customerName || "Guest";
}

function shippingAddress(d: DeliveryRecord) {
  const a = d.sale?.customerAddress;
  if (!a) return "-";
  return [a.village, a.district, a.province, a.country]
    .filter(Boolean)
    .join(", ");
}

export default function DeliveryTrackingPage() {
  const { deliveries, loading, error, refetch } = useDeliveries({
    saleStatus: "confirmed",
  });
  const { updating, updateDelivery } = useUpdateDelivery();

  // null = ທັງໝົດ
  const [filter, setFilter] = React.useState<DeliveryStatus | null>("PACKING");
  const [trackingDraft, setTrackingDraft] = React.useState<
    Record<string, string>
  >({});
  const [toast, setToast] = React.useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1500);
  };

  const visible = filter
    ? deliveries.filter((d) => normalizeStatus(d.status) === filter)
    : deliveries;

  const counts = React.useMemo(() => {
    const acc: Record<DeliveryStatus, number> = {
      PACKING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
    };
    for (const d of deliveries) {
      const k = normalizeStatus(d.status);
      if (k) acc[k]++;
    }
    return acc;
  }, [deliveries]);

  const advanceStatus = async (
    d: DeliveryRecord,
    next: DeliveryStatus,
    tracking?: string
  ) => {
    const result = await updateDelivery(d.id, {
      status: next,
      trackingNumber: tracking || undefined,
    });
    showToast(
      result.success
        ? `${STATUS_META[next].label} ສຳເລັດ`
        : `Failed: ${result.message}`
    );
    if (result.success) refetch({ saleStatus: "confirmed" });
  };

  const handleMarkShipping = (d: DeliveryRecord) => {
    const tracking = (trackingDraft[d.id] || d.trackingNumber || "").trim();
    advanceStatus(d, "SHIPPING", tracking);
  };

  const handleMarkDelivered = (d: DeliveryRecord) =>
    advanceStatus(d, "DELIVERED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ການຕິດຕາມການຈັດສົ່ງ
          </h1>
          <p className="text-slate-600 mt-2">
            ຢືນຢັນຄຳສັ່ງຊື້ທີ່ລໍຖ້າການຈັດສົ່ງໃຫ້ລູກຄ້າ
          </p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === key
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {STATUS_META[key].label} ({counts[key]})
          </button>
        ))}
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
            filter === null
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          ທັງໝົດ ({deliveries.length})
        </button>
      </div>

      {/* Deliveries table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-emerald-900 text-white text-sm">
            <tr>
              <th className="px-4 py-3">ລະຫັດ</th>
              <th className="px-4 py-3">ຊື່ລູກຄ້າ</th>
              <th className="px-4 py-3">ບໍລິສັດຂົນສົ່ງ</th>
              <th className="px-4 py-3">ທີ່ຢູ່</th>
              <th className="px-4 py-3">ລວມ</th>
              <th className="px-4 py-3">ຕິດຕາມ</th>
              <th className="px-4 py-3">ຈຳນວນ</th>
              <th className="px-4 py-3">ສະຖານະ</th>
              <th className="px-4 py-3">ການດຳເນີນ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  ກຳລັງໂຫຼດ…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  ບໍ່ມີຂໍ້ມູນຈັດສົ່ງໃນສະຖານະນີ້.
                </td>
              </tr>
            ) : (
              visible.map((d) => {
                const itemsCount = (d.sale?.saleDetails ?? []).reduce(
                  (sum, x) => sum + Number(x.quantity || 0),
                  0
                );
                const status = normalizeStatus(d.status);
                const isPacking = status === "PACKING";
                const isShipping = status === "SHIPPING";
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">
                        {(d.sale?.id ?? d.id).slice(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{customerName(d)}</div>
                      <div className="text-xs text-gray-500">
                        {d.sale?.customer?.phoneNumber || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{d.deliveryService}</div>
                      {d.branch && (
                        <div className="text-xs text-gray-500">{d.branch}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[220px]">
                      {shippingAddress(d)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatMoney(d.sale?.totalAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      {isPacking ? (
                        <input
                          type="text"
                          placeholder="Tracking #"
                          value={trackingDraft[d.id] ?? d.trackingNumber ?? ""}
                          onChange={(e) =>
                            setTrackingDraft((prev) => ({
                              ...prev,
                              [d.id]: e.target.value,
                            }))
                          }
                          className="w-32 px-2 py-1 text-xs rounded-md border border-gray-200 focus:border-emerald-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-xs text-gray-600">
                          {d.trackingNumber || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">{itemsCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusBadge(d.status)}`}
                      >
                        {statusLabel(d.status)}
                      </span>
                      {d.shippedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(d.shippedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {isPacking && (
                          <button
                            disabled={updating}
                            onClick={() => handleMarkShipping(d)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-40"
                          >
                            ເລີ່ມຈັດສົ່ງ
                          </button>
                        )}
                        {isShipping && (
                          <button
                            disabled={updating}
                            onClick={() => handleMarkDelivered(d)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-teal-700 rounded-md hover:bg-teal-800 disabled:opacity-40"
                          >
                            ສົ່ງສຳເລັດ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
