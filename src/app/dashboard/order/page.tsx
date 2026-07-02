"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  AsyncIcon,
  CheckIcon,
  CloseIcon,
  ListIcon,
  SearchIcon,
} from "@/src/components/icons/page";
import OrderDetailsPanel from "@/src/components/plantDetail";
import DateRangePicker from "@/src/components/DateRangePicker";
import React from "react";
import {
  useSales,
  useUpdateSaleStatus,
  type SaleRecord,
} from "@/src/features/sale/useSale";
import { refreshPendingOrderCount } from "@/src/features/sale/usePendingOrders";
import { refreshDeliveryCount } from "@/src/features/delivery/usePackingCount";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon?: React.ReactNode }
> = {
  pending: {
    label: "ກຳລັງລໍຖ້າ",
    color: "bg-orange-400",
    icon: <ListIcon className="text-gray-400" size={32} />,
  },
  confirmed: {
    label: "ອະນຸມັດ",
    color: "bg-emerald-500",
    icon: <AsyncIcon className="text-gray-400" size={32} />,
  },
  paid: { label: "ຈ່າຍແລ້ວ", color: "bg-emerald-500" },
  completed: {
    label: "ສຳເລັດ",
    color: "bg-teal-700",
    icon: <CheckIcon className="text-gray-400" size={32} />,
  },
  cancelled: {
    label: "ຍົກເລີກ",
    color: "bg-red-500",
    icon: <CloseIcon className="text-gray-400" size={32} />,
  },
};

const SUMMARY_KEYS = ["pending", "confirmed", "completed", "cancelled"] as const;

/// Tailwind classes per status card. Tuned for a clean, colourful dashboard.
const STATUS_CARD_STYLES: Record<
  (typeof SUMMARY_KEYS)[number],
  {
    bg: string;
    blob: string;
    label: string;
    value: string;
    iconBg: string;
    iconColor: string;
    ring: string;
  }
> = {
  pending: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-100",
    blob: "bg-orange-300",
    label: "text-orange-800",
    value: "text-orange-900",
    iconBg: "bg-white/70",
    iconColor: "text-orange-600",
    ring: "ring-orange-400",
  },
  confirmed: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    blob: "bg-emerald-400",
    label: "text-emerald-800",
    value: "text-emerald-900",
    iconBg: "bg-white/70",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-400",
  },
  completed: {
    bg: "bg-gradient-to-br from-teal-50 to-cyan-100",
    blob: "bg-teal-400",
    label: "text-teal-800",
    value: "text-teal-900",
    iconBg: "bg-white/70",
    iconColor: "text-teal-700",
    ring: "ring-teal-400",
  },
  cancelled: {
    bg: "bg-gradient-to-br from-rose-50 to-red-100",
    blob: "bg-rose-300",
    label: "text-rose-800",
    value: "text-rose-900",
    iconBg: "bg-white/70",
    iconColor: "text-rose-600",
    ring: "ring-rose-400",
  },
};

const statusLabel = (s: string) => STATUS_META[s.toLowerCase()]?.label || s;
const statusColor = (s: string) =>
  STATUS_META[s.toLowerCase()]?.color || "bg-gray-400";

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "";
  const d = new Date(
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value
  );
  if (isNaN(d.getTime())) return String(value);
  // Numeric only — e.g. "5/21/2026".
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );

function customerDisplayName(order: SaleRecord) {
  if (order.customer) {
    const full =
      `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim();
    return full || "Customer";
  }
  return order.customerName || "Guest";
}

const OrderDashboard = () => {
  const { sales, loading, error, refetch } = useSales();
  const { updating, updateStatus } = useUpdateSaleStatus();

  const [selectedOrder, setSelectedOrder] = React.useState<SaleRecord | null>(
    null
  );
  const [toast, setToast] = React.useState<string | null>(null);
  // null = ທັງໝົດ (all)
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const statusRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  };

  const changeStatus = async (
    order: SaleRecord,
    next: "confirmed" | "cancelled"
  ) => {
    const result = await updateStatus(order.id, next);
    showToast(
      result.success
        ? `Order ${customerDisplayName(order)} ${next}`
        : `Failed: ${result.message}`
    );
    if (result.success) {
      setSelectedOrder(null);
      refetch({ status: selectedStatus ?? undefined });
      // Update the sidebar badges instantly: confirming/cancelling drops the
      // pending-order count, and confirming spawns a delivery in PACKING.
      refreshPendingOrderCount();
      refreshDeliveryCount();
    }
  };

  // Counts only the sales inside the selected date range — so the summary
  // cards update whenever the DateRangePicker changes.
  const counts = React.useMemo(() => {
    const acc: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    const orderDay = (v: SaleRecord["saleDate"]) => {
      if (!v) return "";
      const d = new Date(
        typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v,
      );
      return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    };
    for (const s of sales) {
      if (dateFrom || dateTo) {
        const day = orderDay(s.saleDate);
        if (!day) continue;
        if (dateFrom && day < dateFrom) continue;
        if (dateTo && day > dateTo) continue;
      }
      const k = s.status.toLowerCase();
      if (k === "paid") acc.confirmed++;
      else if (k in acc) acc[k]++;
    }
    return acc;
  }, [sales, dateFrom, dateTo]);

  const statusOptions = React.useMemo(
    () => Array.from(new Set(sales.map((s) => s.status.toLowerCase()))),
    [sales]
  );

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const orderDay = (v: SaleRecord["saleDate"]) => {
      if (!v) return "";
      const d = new Date(
        typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v
      );
      return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    };
    return sales.filter((s) => {
      if (selectedStatus && s.status.toLowerCase() !== selectedStatus) {
        return false;
      }
      if (dateFrom || dateTo) {
        const day = orderDay(s.saleDate);
        if (!day) return false;
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
      }
      if (!q) return true;
      return (
        customerDisplayName(s).toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [sales, selectedStatus, searchQuery, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ການຈັດອໍເດີ່</h1>
            <p className="text-sm text-gray-500 mt-1">
              ກວດສອບ, ຢືນຢັນ ແລະ ຍົກເລີກອໍເດີຈາກລູກຄ້າ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ອໍເດີທັງໝົດ
              </div>
              <div className="text-xl font-bold text-gray-900">
                {filteredOrders.length}
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm">
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                ຍອດລວມ
              </div>
              <div className="text-xl font-bold">
                ₭{" "}
                {formatMoney(
                  filteredOrders.reduce(
                    (s, o) => s + Number(o.totalAmount || 0),
                    0,
                  ),
                )}
              </div>
            </div>
            {/* <button
              onClick={() => refetch({ status: selectedStatus ?? undefined })}
              className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition"
              title="Refresh"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button> */}
          </div>
        </header>

        {/* Stats — colour-coded summary cards filtered by date range */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUMMARY_KEYS.map((key) => {
            const meta = STATUS_META[key];
            const active = selectedStatus === key;
            const style = STATUS_CARD_STYLES[key];
            const total = counts[key];
            return (
              <article
                key={key}
                onClick={() => setSelectedStatus(active ? null : key)}
                className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${style.bg} ${
                  active
                    ? `ring-2 ring-offset-2 ${style.ring}`
                    : "shadow-sm"
                }`}
              >
                {/* Decorative background blob */}
                <div
                  className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 ${style.blob}`}
                />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${style.label}`}>
                      {meta.label}
                    </p>
                    <p className={`text-4xl font-bold mt-2 ${style.value}`}>
                      {total}
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-2xl ${style.iconBg} ${style.iconColor}`}
                  >
                    {meta.icon}
                  </div>
                </div>

                <div
                  className={`relative mt-3 text-xs font-medium ${style.label}`}
                >
                  {active ? "✓ ກອງຢູ່" : "ກົດເພື່ອກອງ"}
                </div>
              </article>
            );
          })}
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3">
            {/* Search — bounded so it doesn't eat the whole row */}
            <div className="relative w-full lg:w-80">
              <SearchIcon
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ຄົ້ນຫາລະຫັດ ຫລື ຊື່ລູກຄ້າ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Divider on desktop */}
            <div className="hidden lg:block h-8 w-px bg-gray-200" />

            {/* Right cluster: date + status + reset */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <div className="flex items-center gap-1">
                <DateRangePicker
                  value={
                    dateFrom || dateTo
                      ? { from: dateFrom, to: dateTo }
                      : undefined
                  }
                  onChange={(v) => {
                    setDateFrom(v.from);
                    setDateTo(v.to);
                  }}
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="ລ້າງ"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedStatus
                        ? statusColor(selectedStatus)
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-gray-700">
                    {selectedStatus
                      ? statusLabel(selectedStatus)
                      : "ທຸກສະຖານະ"}
                  </span>
                  {showStatusDropdown ? (
                    <ArrowUpIcon size={16} className="text-gray-500" />
                  ) : (
                    <ArrowDownIcon size={16} className="text-gray-500" />
                  )}
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {[null, ...statusOptions].map((s) => {
                      const active = selectedStatus === s;
                      return (
                        <button
                          key={s ?? "all"}
                          onClick={() => {
                            setSelectedStatus(s);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm transition hover:bg-emerald-50 ${
                            active
                              ? "text-emerald-700 font-medium bg-emerald-50"
                              : "text-gray-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              s ? statusColor(s) : "bg-gray-400"
                            }`}
                          />
                          {s ? statusLabel(s) : "ທຸກສະຖານະ"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(searchQuery || selectedStatus || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus(null);
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                  </svg>
                  ລ້າງຕົວກອງ
                </button>
              )}
            </div>
          </div>

          {/* Active-filter chip rail (shows what's filtered) */}
          {(searchQuery || selectedStatus || dateFrom || dateTo) && (
            <div className="px-3 pb-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500">ກອງຢູ່:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                  🔍 {searchQuery}
                </span>
              )}
              {selectedStatus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs text-emerald-700">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusColor(selectedStatus)}`}
                  />
                  {statusLabel(selectedStatus)}
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700">
                  📅 {dateFrom || "…"} → {dateTo || "…"}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Orders list — modern stacked cards */}
        <section className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <span className="text-sm">ກຳລັງໂຫຼດຄຳສັ່ງຊື້…</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-rose-600">
                <div className="text-3xl">⚠️</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="text-6xl">📭</div>
                <div className="text-sm">ຍັງບໍ່ມີຄຳສັ່ງຊື້ໃນຊ່ວງເວລານີ້</div>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const itemsCount = order.saleDetails.reduce(
                (sum, d) => sum + Number(d.quantity || 0),
                0,
              );
              const statusKey = order.status.toLowerCase();
              const cardStyle =
                STATUS_CARD_STYLES[
                  statusKey as keyof typeof STATUS_CARD_STYLES
                ];
              const isApp = order.source === "PLENT_APP";
              const initial =
                customerDisplayName(order)?.[0]?.toUpperCase() ?? "?";
              return (
                <article
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  {/* Status accent bar on the left */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor(order.status)}`}
                  />

                  <div className="pl-6 pr-5 py-4 flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ring-1 ${
                        cardStyle
                          ? `${cardStyle.bg} ${cardStyle.label} ring-white`
                          : "bg-gray-100 text-gray-700 ring-white"
                      }`}
                    >
                      {initial}
                    </div>

                    {/* Customer + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">
                          {customerDisplayName(order)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[11px] text-gray-600">
                          {order.code || order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            isApp
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isApp ? "📱 ມືຖື" : "💻 POS"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M16 3v4M8 3v4M3 11h18" />
                          </svg>
                          {formatDate(order.saleDate)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                          {itemsCount} ລາຍການ
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400">
                        ຍອດ
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        ₭ {formatMoney(order.totalAmount)}
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        cardStyle
                          ? `${cardStyle.bg} ${cardStyle.label}`
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusColor(order.status)}`}
                      />
                      {statusLabel(order.status)}
                    </span>

                    {/* Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      ກວດສອບ
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {selectedOrder && (
          <OrderDetailsPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onConfirm={(o) => changeStatus(o, "confirmed")}
            onCancel={(o) => changeStatus(o, "cancelled")}
            busy={updating}
          />
        )}

        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg ring-1 ring-emerald-500/30 animate-in fade-in slide-in-from-top">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" />
              </svg>
              {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
