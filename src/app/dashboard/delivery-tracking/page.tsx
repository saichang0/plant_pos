"use client";

import React from "react";
import {
  useDeliveries,
  useUpdateDelivery,
  type DeliveryRecord,
} from "@/src/features/delivery/useDelivery";
import { refreshDeliveryCount } from "@/src/features/delivery/usePackingCount";

type DeliveryStatus = "PACKING" | "SHIPPING" | "DELIVERED";

const STATUS_META: Record<
  DeliveryStatus,
  { label: string; chip: string; bar: string; ring: string; gradient: string; blob: string }
> = {
  PACKING: {
    label: "ກຳລັງຫໍ່",
    chip: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
    ring: "ring-orange-300",
    gradient: "from-orange-50 to-amber-100",
    blob: "bg-orange-300",
  },
  SHIPPING: {
    label: "ກຳລັງຈັດສົ່ງ",
    chip: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
    ring: "ring-blue-300",
    gradient: "from-blue-50 to-blue-100",
    blob: "bg-blue-300",
  },
  DELIVERED: {
    label: "ສົ່ງສຳເລັດ",
    chip: "bg-teal-100 text-teal-700",
    bar: "bg-teal-500",
    ring: "ring-teal-300",
    gradient: "from-teal-50 to-cyan-100",
    blob: "bg-teal-300",
  },
};

const STATUS_ORDER: DeliveryStatus[] = ["PACKING", "SHIPPING", "DELIVERED"];

const normalizeStatus = (s: string): DeliveryStatus | null => {
  const u = s?.toUpperCase();
  // Treat SHIPPED as DELIVERED for display purposes.
  if (u === "SHIPPED") return "DELIVERED";
  return u in STATUS_META ? (u as DeliveryStatus) : null;
};

function formatDate(value: string | number | Date | undefined | null) {
  if (!value) return "-";
  const d = new Date(
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value,
  );
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const formatMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US");

function customerName(d: DeliveryRecord) {
  if (d.sale?.customer) {
    const n = `${d.sale.customer.firstName ?? ""} ${
      d.sale.customer.lastName ?? ""
    }`.trim();
    if (n) return n;
  }
  return d.sale?.customerName || "Guest";
}

export default function DeliveryTrackingPage() {
  const { deliveries, loading, error, refetch } = useDeliveries({
    saleStatus: "confirmed",
  });
  const { updating, updateDelivery } = useUpdateDelivery();

  const [filter, setFilter] = React.useState<DeliveryStatus | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [trackingModal, setTrackingModal] = React.useState<DeliveryRecord | null>(
    null,
  );
  const [trackingInput, setTrackingInput] = React.useState("");
  const [confirmDeliver, setConfirmDeliver] = React.useState<DeliveryRecord | null>(
    null,
  );
  const [toast, setToast] = React.useState<{ msg: string; ok: boolean } | null>(
    null,
  );

  const selectedDelivery = React.useMemo(
    () => deliveries.find((d) => d.id === selectedId) || null,
    [deliveries, selectedId],
  );

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 1800);
  };

  // Counts including SHIPPED-as-DELIVERED.
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

  // Filter + search.
  const visible = React.useMemo(() => {
    let list = deliveries;
    if (filter) {
      list = list.filter((d) => normalizeStatus(d.status) === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          customerName(d).toLowerCase().includes(q) ||
          (d.sale?.code || "").toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.deliveryService?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [deliveries, filter, search]);

  // ─── Status advance ─────────────────────────────────────────
  const openStartShipping = (d: DeliveryRecord) => {
    setTrackingInput(d.trackingNumber || "");
    setTrackingModal(d);
  };

  const confirmStartShipping = async () => {
    if (!trackingModal) return;
    const r = await updateDelivery(trackingModal.id, {
      status: "SHIPPING",
      trackingNumber: trackingInput.trim() || undefined,
    });
    setTrackingModal(null);
    showToast(r.success ? "ເລີ່ມຈັດສົ່ງ ✓" : `ບໍ່ສຳເລັດ: ${r.message}`, r.success);
    if (r.success) {
      refetch({ saleStatus: "confirmed" });
      // Leaving PACKING → the sidebar delivery badge should drop.
      refreshDeliveryCount();
    }
  };

  const confirmMarkDelivered = async () => {
    if (!confirmDeliver) return;
    const r = await updateDelivery(confirmDeliver.id, { status: "DELIVERED" });
    setConfirmDeliver(null);
    showToast(r.success ? "ສົ່ງສຳເລັດ ✓" : `ບໍ່ສຳເລັດ: ${r.message}`, r.success);
    if (r.success) {
      setSelectedId(null);
      refetch({ saleStatus: "confirmed" });
      refreshDeliveryCount();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ການຕິດຕາມການຈັດສົ່ງ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ຢືນຢັນຄຳສັ່ງຊື້ທີ່ລໍຖ້າການຈັດສົ່ງໃຫ້ລູກຄ້າ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ທັງໝົດ
              </div>
              <div className="text-xl font-bold text-gray-900">
                {deliveries.length}
              </div>
            </div>
            <button
              onClick={() => refetch({ saleStatus: "confirmed" })}
              className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition"
              title="Refresh"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          </div>
        </header>

        {/* KPI summary by status */}
        <section className="grid grid-cols-3 gap-4">
          {STATUS_ORDER.map((key) => {
            const m = STATUS_META[key];
            const active = filter === key;
            return (
              <article
                key={key}
                onClick={() => setFilter(active ? null : key)}
                className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-br ${m.gradient} ${
                  active ? `ring-2 ring-offset-2 ${m.ring}` : "shadow-sm"
                }`}
              >
                <div
                  className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 ${m.blob}`}
                />
                <div className="relative">
                  <p className="text-xs font-medium text-gray-700">{m.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {counts[key]}
                  </p>
                  <div className="mt-2 text-[10px] font-medium text-gray-600">
                    {active ? "✓ ກອງຢູ່" : "ກົດເພື່ອກອງ"}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Filter bar */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="ຄົ້ນຫາລະຫັດ, ຊື່ລູກຄ້າ, ບໍລິສັດຂົນສົ່ງ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
              >
                ✕
              </button>
            )}
          </div>
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
            >
              ລ້າງຕົວກອງ
            </button>
          )}
        </div>

        {/* Deliveries list */}
        <section className="space-y-3">
          {loading ? (
            <Empty>
              <Spinner />
              <p className="text-sm mt-3 text-gray-500">ກຳລັງໂຫຼດ…</p>
            </Empty>
          ) : error ? (
            <Empty tone="rose">
              <div className="text-3xl">⚠️</div>
              <div className="text-sm">{error}</div>
            </Empty>
          ) : visible.length === 0 ? (
            <Empty>
              <div className="text-6xl">📭</div>
              <div className="text-sm text-gray-400">
                ບໍ່ມີຂໍ້ມູນຈັດສົ່ງ
              </div>
            </Empty>
          ) : (
            visible.map((d) => {
              const status = normalizeStatus(d.status);
              const meta = status ? STATUS_META[status] : null;
              const isPacking = status === "PACKING";
              const isShipping = status === "SHIPPING";
              const itemsCount = (d.sale?.saleDetails ?? []).reduce(
                (sum, x) => sum + Number(x.quantity || 0),
                0,
              );
              const a = d.sale?.customerAddress;
              const isApp = d.sale?.source === "PLENT_APP";
              return (
                <article
                  key={d.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                >
                  {/* Status accent bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta?.bar ?? "bg-gray-300"}`}
                  />

                  <div className="pl-5 pr-4 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Customer + code */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedId(d.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {customerName(d)}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                          {d.sale?.code || d.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            isApp
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isApp ? "📱 ມືຖື" : "💻 POS"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        {d.sale?.customer?.phoneNumber && (
                          <span>📞 {d.sale.customer.phoneNumber}</span>
                        )}
                        {a?.village && a.district && (
                          <span>📍 {a.village}, {a.district}</span>
                        )}
                        <span>📦 {itemsCount} ລາຍການ</span>
                      </div>
                    </div>

                    {/* Timeline mini */}
                    <div className="hidden md:flex items-center gap-1.5 px-3">
                      {STATUS_ORDER.map((s, i) => {
                        const currentIdx = status
                          ? STATUS_ORDER.indexOf(status)
                          : -1;
                        const reached = i <= currentIdx;
                        const m = STATUS_META[s];
                        return (
                          <React.Fragment key={s}>
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                reached ? m.bar : "bg-gray-200"
                              }`}
                              title={m.label}
                            />
                            {i < STATUS_ORDER.length - 1 && (
                              <div
                                className={`w-6 h-0.5 ${
                                  i < currentIdx ? m.bar : "bg-gray-200"
                                }`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Service */}
                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ບໍລິສັດ
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {d.deliveryService || "-"}
                      </p>
                      {d.branch && (
                        <p className="text-[10px] text-gray-500">{d.branch}</p>
                      )}
                    </div>

                    {/* Total */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ຍອດ
                      </p>
                      <p className="text-base font-bold text-emerald-700">
                        ₭ {formatMoney(d.sale?.totalAmount ?? 0)}
                      </p>
                    </div>

                    {/* Status pill */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        meta?.chip ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta?.bar ?? "bg-gray-400"}`} />
                      {meta?.label ?? d.status}
                    </span>

                    {/* Actions */}
                    <div
                      className="shrink-0 flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPacking && (
                        <button
                          disabled={updating}
                          onClick={() => openStartShipping(d)}
                          className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-sm disabled:opacity-40"
                        >
                          🚚 ເລີ່ມຈັດສົ່ງ
                        </button>
                      )}
                      {isShipping && (
                        <button
                          disabled={updating}
                          onClick={() => setConfirmDeliver(d)}
                          className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl hover:from-teal-700 hover:to-teal-800 shadow-sm disabled:opacity-40"
                        >
                          ✓ ສົ່ງສຳເລັດ
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedId(d.id)}
                        className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100"
                      >
                        ລາຍລະອຽດ
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg ${
              toast.ok
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                : "bg-gradient-to-r from-rose-600 to-rose-700"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}

      {/* Tracking-number modal (PACKING → SHIPPING) */}
      {trackingModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setTrackingModal(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
              <p className="text-xs opacity-80">ເລີ່ມຈັດສົ່ງ</p>
              <p className="text-lg font-bold">{customerName(trackingModal)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ເລກຕິດຕາມ (ບໍ່ບັງຄັບ)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="ໃສ່ເລກຕິດຕາມຈາກບໍລິສັດຂົນສົ່ງ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ບໍລິສັດ: <span className="font-semibold">{trackingModal.deliveryService}</span>
                  {trackingModal.branch ? ` · ສາຂາ: ${trackingModal.branch}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTrackingModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={confirmStartShipping}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                  {updating ? "ກຳລັງບັນທຶກ…" : "ເລີ່ມຈັດສົ່ງ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deliver modal */}
      {confirmDeliver && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setConfirmDeliver(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ຢືນຢັນສົ່ງສຳເລັດ
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              ໝາຍ <span className="font-semibold text-gray-800">{customerName(confirmDeliver)}</span>{" "}
              ວ່າສົ່ງສຳເລັດແລ້ວ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeliver(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={confirmMarkDelivered}
                disabled={updating}
                className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-semibold hover:from-teal-700 hover:to-teal-800 disabled:opacity-50"
              >
                {updating ? "ກຳລັງບັນທຶກ…" : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <DeliveryDetailDrawer
        delivery={selectedDelivery}
        onClose={() => setSelectedId(null)}
        onMarkShipping={(d) => {
          setSelectedId(null);
          openStartShipping(d);
        }}
        onMarkDelivered={(d) => {
          setSelectedId(null);
          setConfirmDeliver(d);
        }}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────

function DeliveryDetailDrawer({
  delivery,
  onClose,
  onMarkShipping,
  onMarkDelivered,
}: {
  delivery: DeliveryRecord | null;
  onClose: () => void;
  onMarkShipping: (d: DeliveryRecord) => void;
  onMarkDelivered: (d: DeliveryRecord) => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (delivery) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [delivery, onClose]);

  if (!delivery) return null;

  const d = delivery;
  const status = normalizeStatus(d.status);
  const meta = status ? STATUS_META[status] : null;
  const isPacking = status === "PACKING";
  const isShipping = status === "SHIPPING";
  const a = d.sale?.customerAddress;
  const details = d.sale?.saleDetails ?? [];
  const subTotal = details.reduce((s, x) => s + Number(x.totalPrice || 0), 0);
  const tax = Number(d.sale?.taxAmount || 0);
  const discount = Number(d.sale?.discountAmount || 0);
  const currentIdx = status ? STATUS_ORDER.indexOf(status) : -1;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className={`px-6 py-5 text-white bg-gradient-to-r ${
          status === "DELIVERED"
            ? "from-teal-700 to-teal-800"
            : status === "SHIPPING"
              ? "from-blue-700 to-blue-800"
              : "from-orange-600 to-orange-700"
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                ລາຍລະອຽດການຈັດສົ່ງ
              </div>
              <div className="mt-1 text-2xl font-bold font-mono">
                {d.sale?.code || d.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${meta?.chip}`}>
                  {meta?.label ?? d.status}
                </span>
                <span className="text-xs opacity-80">
                  {formatDate(d.sale?.saleDate)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm">
          {/* Timeline */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              ສະຖານະການຈັດສົ່ງ
            </h3>
            <div className="flex items-center justify-between gap-2">
              {STATUS_ORDER.map((s, i) => {
                const m = STATUS_META[s];
                const reached = i <= currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                          reached
                            ? `${m.bar} text-white shadow-md`
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={`text-[10px] text-center font-medium ${
                          reached ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {m.label}
                      </span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          i < currentIdx ? STATUS_META[STATUS_ORDER[i + 1]].bar : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Customer */}
          <Section title="ລູກຄ້າ">
            <div className="font-semibold text-gray-900">
              {customerName(d)}
            </div>
            {d.sale?.customer?.phoneNumber && (
              <div className="text-gray-600 text-sm">
                📞 {d.sale.customer.phoneNumber}
              </div>
            )}
            {d.sale?.customer?.email && (
              <div className="text-gray-600 text-sm">
                ✉ {d.sale.customer.email}
              </div>
            )}
          </Section>

          {/* Address */}
          <Section title="ທີ່ຢູ່ຈັດສົ່ງ">
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="ແຂວງ" value={a?.province} />
              <DetailRow label="ເມືອງ" value={a?.district} />
              <DetailRow label="ບ້ານ" value={a?.village} />
              <DetailRow label="ປະເທດ" value={a?.country} />
            </div>
          </Section>

          {/* Delivery service */}
          <Section title="ການຈັດສົ່ງ">
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="ບໍລິສັດ" value={d.deliveryService} />
              <DetailRow label="ສາຂາ" value={d.branch} />
              <DetailRow
                label="ເລກຕິດຕາມ"
                value={d.trackingNumber || "—"}
                emphasize={!!d.trackingNumber}
              />
              <DetailRow
                label="ສົ່ງເມື່ອ"
                value={d.shippedAt ? formatDate(d.shippedAt) : "—"}
              />
            </div>
          </Section>

          {/* Items */}
          <Section title={`ລາຍການສິນຄ້າ (${details.length})`}>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {details.length === 0 ? (
                <div className="px-4 py-5 text-center text-gray-500">
                  ບໍ່ມີລາຍການ
                </div>
              ) : (
                details.map((item, i) => (
                  <div
                    key={item.id || i}
                    className={`px-4 py-3 flex items-center gap-3 ${
                      i !== details.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    {item.product?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.imageUrl}
                        alt={item.product?.name || ""}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        🌱
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {item.product?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        x{item.quantity} @ ₭ {formatMoney(Number(item.unitPrice))}
                      </div>
                    </div>
                    <div className="text-right font-semibold text-emerald-700">
                      ₭ {formatMoney(Number(item.totalPrice))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* Totals */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-2">
            <TotalRow label="ຍອດສິນຄ້າ" value={subTotal} />
            {tax > 0 && <TotalRow label="ພາສີ" value={tax} />}
            {discount > 0 && <TotalRow label="ສ່ວນຫຼຸດ" value={-discount} />}
            <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">ລວມຍອດ</span>
              <span className="text-xl font-bold text-emerald-700">
                ₭ {formatMoney(Number(d.sale?.totalAmount || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            ປິດ
          </button>
          {isPacking && (
            <button
              onClick={() => onMarkShipping(d)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              🚚 ເລີ່ມຈັດສົ່ງ
            </button>
          )}
          {isShipping && (
            <button
              onClick={() => onMarkDelivered(d)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-sm"
            >
              ✓ ສົ່ງສຳເລັດ
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h3>
      <div className="rounded-xl border border-gray-200 p-4">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value?: string | null;
  emphasize?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`font-medium ${
          emphasize ? "text-emerald-700" : "text-gray-900"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-medium">
        {value < 0 ? "-" : ""}₭ {formatMoney(Math.abs(value))}
      </span>
    </div>
  );
}

function Empty({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "rose";
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border py-16 text-center ${
        tone === "rose" ? "border-rose-100" : "border-gray-100"
      }`}
    >
      <div
        className={`flex flex-col items-center gap-2 ${
          tone === "rose" ? "text-rose-600" : "text-gray-400"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
  );
}
