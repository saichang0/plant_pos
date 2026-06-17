"use client";

import React, { useMemo, useState } from "react";
import { usePurchaseOrders } from "@/src/features/import/useImport";

const STATUS_META: Record<string, { label: string; dotColor: string; bg: string; text: string }> = {
  pending: { label: "ລໍຖ້າ", dotColor: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-700" },
  confirmed: { label: "ຢືນຢັນ", dotColor: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  received: { label: "ຮັບເຂົ້າແລ້ວ", dotColor: "bg-teal-600", bg: "bg-teal-50", text: "text-teal-700" },
  completed: { label: "ສຳເລັດ", dotColor: "bg-teal-600", bg: "bg-teal-50", text: "text-teal-700" },
  cancelled: { label: "ຍົກເລີກ", dotColor: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
};

function statusMeta(s: string) {
  return (
    STATUS_META[s?.toLowerCase()] ?? {
      label: s || "-",
      dotColor: "bg-gray-400",
      bg: "bg-gray-100",
      text: "text-gray-700",
    }
  );
}

function formatDate(value: string | number | undefined): string {
  if (!value) return "";
  const d = new Date(typeof value === "string" ? value : Number(value));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("lo-LA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function formatMoney(n: number | undefined): string {
  if (n == null || isNaN(Number(n))) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(n));
}

export default function PurchasesReportPage() {
  const { purchaseOrders, loading, error } = usePurchaseOrders();
  const [statusValue, setStatusValue] = useState("");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const acc: Record<string, number> = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const o of purchaseOrders) {
      const k = (o.status || "").toLowerCase();
      if (k in acc) acc[k]++;
      else if (k === "received") acc.completed++;
    }
    return acc;
  }, [purchaseOrders]);

  const grandTotal = useMemo(
    () => purchaseOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
    [purchaseOrders],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchaseOrders.filter((o) => {
      if (statusValue && (o.status || "").toLowerCase() !== statusValue) return false;
      if (!q) return true;
      return (
        (o.supplier?.name || "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [purchaseOrders, statusValue, search]);

  const SUMMARY = [
    { key: "", label: "ໃບສັ່ງຊື້ທັງໝົດ", count: purchaseOrders.length, grad: "from-indigo-600 to-violet-700" },
    { key: "pending", label: "ລໍຖ້າ", count: counts.pending, grad: "from-orange-500 to-amber-600" },
    { key: "confirmed", label: "ຢືນຢັນ", count: counts.confirmed, grad: "from-emerald-600 to-emerald-700" },
    { key: "completed", label: "ຮັບເຂົ້າແລ້ວ", count: counts.completed, grad: "from-teal-600 to-cyan-700" },
  ];

  const hasFilters = search || statusValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ລາຍງານການສັ່ງຊື້</h1>
            <p className="text-sm text-gray-500 mt-1">
              ສະຫຼຸບໃບສັ່ງຊື້ສິນຄ້າຈາກຜູ້ສະໜອງ ກອງຕາມສະຖານະ
            </p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm">
            <div className="text-[10px] uppercase tracking-wider opacity-80">ມູນຄ່າສັ່ງຊື້ລວມ</div>
            <div className="text-xl font-bold">₭ {formatMoney(grandTotal)}</div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUMMARY.map((s) => {
            const active = statusValue === s.key && s.key !== "";
            return (
              <article
                key={s.key || "all"}
                onClick={() => setStatusValue(s.key && active ? "" : s.key)}
                className={`relative overflow-hidden rounded-3xl p-5 text-white cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-br ${s.grad} ${
                  active ? "ring-2 ring-offset-2 ring-emerald-400" : "shadow-sm"
                }`}
              >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <p className="relative text-sm font-medium opacity-80">{s.label}</p>
                <p className="relative text-4xl font-bold mt-2">{s.count}</p>
                <div className="relative mt-3 text-xs font-medium opacity-80">
                  {s.key ? (active ? "✓ ກອງຢູ່" : "ກົດເພື່ອກອງ") : "ລວມທັງໝົດ"}
                </div>
              </article>
            );
          })}
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 p-3">
            <div className="relative w-full lg:w-96">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="ຄົ້ນຫາລະຫັດ ຫລື ຊື່ຜູ້ສະໜອງ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              />
            </div>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setStatusValue(""); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 lg:ml-auto"
              >
                ✕ ລ້າງຕົວກອງ
              </button>
            )}
          </div>
        </section>

        {/* Table */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="px-5 py-3 font-medium">ລະຫັດ</th>
                  <th className="px-5 py-3 font-medium">ຜູ້ສະໜອງ</th>
                  <th className="px-5 py-3 font-medium">ວັນທີສັ່ງ</th>
                  <th className="px-5 py-3 font-medium">ພະນັກງານ</th>
                  <th className="px-5 py-3 font-medium text-center">ລາຍການ</th>
                  <th className="px-5 py-3 font-medium text-right">ມູນຄ່າ</th>
                  <th className="px-5 py-3 font-medium text-center">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-400">ກຳລັງໂຫຼດຂໍ້ມູນ…</td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={7} className="py-16 text-center text-rose-600">⚠️ {error}</td></tr>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-400">📭 ບໍ່ມີໃບສັ່ງຊື້</td></tr>
                )}
                {!loading && !error &&
                  filtered.map((o) => {
                    const meta = statusMeta(o.status);
                    const staff = o.user ? `${o.user.firstName} ${o.user.lastName ?? ""}`.trim() : "-";
                    return (
                      <tr key={o.id} className="hover:bg-emerald-50/40">
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[11px] text-gray-600">
                            {o.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{o.supplier?.name || "-"}</td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(o.orderDate)}</td>
                        <td className="px-5 py-3 text-gray-600">{staff}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{o.purchaseOrderDetails?.length ?? 0}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                          ₭ {formatMoney(o.totalPrice)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
