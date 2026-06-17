"use client";

import React, { useMemo, useState } from "react";
import { useSalesHistory } from "@/src/features/history/useHistory";
import DateRangePicker, { defaultThisWeek } from "@/src/components/DateRangePicker";
import type { DateRangeValue } from "@/src/components/DateRangePicker";

const STATUS_OPTIONS = [
  { value: "", label: "ທັງໝົດ" },
  { value: "pending", label: "ລໍຖ້າ" },
  { value: "confirmed", label: "ຢືນຢັນ" },
  { value: "shipping", label: "ກຳລັງສົ່ງ" },
  { value: "completed", label: "ສຳເລັດ" },
  { value: "cancelled", label: "ຍົກເລີກ" },
];

const STATUS_META: Record<
  string,
  { label: string; dotColor: string; bg: string; text: string; blob: string; ring: string }
> = {
  pending: {
    label: "ລໍຖ້າ",
    dotColor: "bg-orange-400",
    bg: "bg-gradient-to-br from-orange-50 to-amber-100",
    text: "text-orange-900",
    blob: "bg-orange-300",
    ring: "ring-orange-400",
  },
  confirmed: {
    label: "ຢືນຢັນ",
    dotColor: "bg-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    text: "text-emerald-900",
    blob: "bg-emerald-400",
    ring: "ring-emerald-400",
  },
  shipping: {
    label: "ກຳລັງສົ່ງ",
    dotColor: "bg-blue-500",
    bg: "bg-gradient-to-br from-blue-50 to-sky-100",
    text: "text-blue-900",
    blob: "bg-blue-300",
    ring: "ring-blue-400",
  },
  completed: {
    label: "ສຳເລັດ",
    dotColor: "bg-teal-600",
    bg: "bg-gradient-to-br from-teal-50 to-cyan-100",
    text: "text-teal-900",
    blob: "bg-teal-400",
    ring: "ring-teal-400",
  },
  cancelled: {
    label: "ຍົກເລີກ",
    dotColor: "bg-rose-500",
    bg: "bg-gradient-to-br from-rose-50 to-red-100",
    text: "text-rose-900",
    blob: "bg-rose-300",
    ring: "ring-rose-400",
  },
};

const SUMMARY_KEYS = ["pending", "confirmed", "completed", "cancelled"] as const;

const SUMMARY_ICONS: Record<string, React.ReactNode> = {
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  confirmed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  completed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  cancelled: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
};

function formatDate(value: string | number | undefined): string {
  if (!value) return "";
  const d = new Date(typeof value === "string" ? value : Number(value));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(n: number | undefined): string {
  if (n == null || isNaN(Number(n))) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(n));
}

function statusMeta(s: string) {
  return STATUS_META[s.toLowerCase()] ?? {
    label: s,
    dotColor: "bg-gray-400",
    bg: "bg-gray-100",
    text: "text-gray-700",
    blob: "bg-gray-300",
    ring: "ring-gray-300",
  };
}

export default function SalesHistoryPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultThisWeek);
  const [statusValue, setStatusValue] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"" | "PLENT_APP" | "POS">("");
  const [search, setSearch] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = React.useRef<HTMLDivElement | null>(null);

  const from = dateRange.from;
  const to = dateRange.to;

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { sales, total, loading, error } = useSalesHistory(
    {
      from: from,
      to: new Date(to + "T23:59:59").toISOString(),
      limit: 100,
    },
    statusValue || undefined,
  );

  const grand = useMemo(
    () => sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    [sales],
  );

  const counts = useMemo(() => {
    const acc: Record<string, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const s of sales) {
      const k = s.status.toLowerCase();
      if (k in acc) acc[k]++;
    }
    return acc;
  }, [sales]);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (sourceFilter === "PLENT_APP" && s.source !== "PLENT_APP") return false;
      if (sourceFilter === "POS" && s.source === "PLENT_APP") return false;
      if (!q) return true;
      const name = s.customer
        ? `${s.customer.firstName} ${s.customer.lastName ?? ""}`.trim()
        : s.customerName || "";
      return (
        name.toLowerCase().includes(q) ||
        (s.code || s.id).toLowerCase().includes(q)
      );
    });
  }, [sales, search, sourceFilter]);

  const isDefaultRange = from === defaultThisWeek().from && to === defaultThisWeek().to;
  const hasFilters = search || statusValue || sourceFilter || !isDefaultRange;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ປະຫວັດການຂາຍ</h1>
            <p className="text-sm text-gray-500 mt-1">
              ລາຍການການຂາຍຍ້ອນຫລັງ ກອງຕາມວັນທີ ແລະ ສະຖານະ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ລາຍການທັງໝົດ
              </div>
              <div className="text-xl font-bold text-gray-900">{total}</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm">
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                ຍອດລວມ
              </div>
              <div className="text-xl font-bold">₭ {formatMoney(grand)}</div>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUMMARY_KEYS.map((key) => {
            const meta = STATUS_META[key];
            const active = statusValue === key;
            const count = counts[key];
            return (
              <article
                key={key}
                onClick={() => setStatusValue(active ? "" : key)}
                className={`relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${meta.bg} ${
                  active ? `ring-2 ring-offset-2 ${meta.ring}` : "shadow-sm"
                }`}
              >
                <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 ${meta.blob}`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${meta.text} opacity-80`}>{meta.label}</p>
                    <p className={`text-4xl font-bold mt-2 ${meta.text}`}>{count}</p>
                  </div>
                  <div className={`p-2.5 rounded-2xl bg-white/70 ${meta.text}`}>
                    {SUMMARY_ICONS[key]}
                  </div>
                </div>
                <div className={`relative mt-3 text-xs font-medium ${meta.text} opacity-70`}>
                  {active ? "✓ ກອງຢູ່" : "ກົດເພື່ອກອງ"}
                </div>
              </article>
            );
          })}
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="ຄົ້ນຫາລະຫັດ ຫລື ຊື່ລູກຄ້າ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
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

            <div className="hidden lg:block h-8 w-px bg-gray-200" />

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {/* Date range picker */}
              <div className="flex items-center gap-1">
                <DateRangePicker
                  value={dateRange}
                  onChange={(v) => setDateRange(v)}
                />
                {!isDefaultRange && (
                  <button
                    onClick={() => setDateRange(defaultThisWeek())}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="ລ້າງວັນທີ"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Source filter — POS / App */}
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden text-sm">
                {(["", "POS", "PLENT_APP"] as const).map((src) => {
                  const label = src === "" ? "ທັງໝົດ" : src === "PLENT_APP" ? "📱 ມືຖື" : "💻 POS";
                  const active = sourceFilter === src;
                  return (
                    <button
                      key={src}
                      onClick={() => setSourceFilter(src)}
                      className={`px-3 py-2 transition ${
                        active
                          ? "bg-emerald-600 text-white font-medium"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Status dropdown */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition"
                >
                  <span className={`w-2 h-2 rounded-full ${statusValue ? statusMeta(statusValue).dotColor : "bg-gray-400"}`} />
                  <span className="text-gray-700">
                    {statusValue ? statusMeta(statusValue).label : "ທຸກສະຖານະ"}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    {showStatusDropdown
                      ? <path d="M18 15l-6-6-6 6" />
                      : <path d="M6 9l6 6 6-6" />}
                  </svg>
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {STATUS_OPTIONS.map((opt) => {
                      const active = statusValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setStatusValue(opt.value); setShowStatusDropdown(false); }}
                          className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm transition hover:bg-emerald-50 ${
                            active ? "text-emerald-700 font-medium bg-emerald-50" : "text-gray-700"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${opt.value ? statusMeta(opt.value).dotColor : "bg-gray-400"}`} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setStatusValue(""); setDateRange(defaultThisWeek()); setSourceFilter(""); }}
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

          {/* Active filter chips */}
          {hasFilters && (
            <div className="px-3 pb-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500">ກອງຢູ່:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                  🔍 {search}
                </span>
              )}
              {statusValue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs text-emerald-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta(statusValue).dotColor}`} />
                  {statusMeta(statusValue).label}
                </span>
              )}
              {sourceFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700">
                  {sourceFilter === "PLENT_APP" ? "📱 ມືຖື" : "💻 POS"}
                </span>
              )}
              {!isDefaultRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-xs text-blue-700">
                  📅 {dateRange.from} → {dateRange.to}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Cards list */}
        <section className="space-y-3">
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <span className="text-sm">ກຳລັງໂຫຼດຂໍ້ມູນ…</span>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-rose-600">
                <div className="text-3xl">⚠️</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}
          {!loading && !error && filteredSales.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="text-6xl">📭</div>
                <div className="text-sm">ບໍ່ມີຂໍ້ມູນການຂາຍໃນຊ່ວງເວລານີ້</div>
              </div>
            </div>
          )}
          {!loading && !error && filteredSales.map((s) => {
            const meta = statusMeta(s.status);
            const isApp = s.source === "PLENT_APP";
            const customerName = s.customer
              ? `${s.customer.firstName} ${s.customer.lastName ?? ""}`.trim()
              : s.customerName || "Guest";
            const initial = customerName[0]?.toUpperCase() ?? "?";
            return (
              <article
                key={s.id}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta.dotColor}`} />
                <div className="pl-6 pr-5 py-4 flex items-center gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ring-1 ring-white ${meta.bg} ${meta.text}`}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{customerName}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[11px] text-gray-600">
                        {s.code || s.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${isApp ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {isApp ? "📱 ມືຖື" : "💻 POS"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" />
                        </svg>
                        {formatDate(s.saleDate)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">ຍອດ</div>
                    <div className="text-lg font-bold text-emerald-700">₭ {formatMoney(s.totalAmount)}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                    {meta.label}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
