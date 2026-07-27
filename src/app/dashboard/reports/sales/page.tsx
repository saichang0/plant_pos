"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useReport } from "@/src/features/report/useReport";
import { useCurrentUser } from "@/src/features/user/useUser";
import DateRangePicker, { defaultThisWeek } from "@/src/components/DateRangePicker";
import type { DateRangeValue } from "@/src/components/DateRangePicker";

const STATUS_META: Record<string, { label: string; dotColor: string; bg: string; text: string }> = {
  pending: { label: "ລໍຖ້າ", dotColor: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-700" },
  confirmed: { label: "ຢືນຢັນ", dotColor: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  shipping: { label: "ກຳລັງສົ່ງ", dotColor: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
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

const KPI_ICONS: Record<string, React.ReactNode> = {
  revenue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  cost: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  profit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  orders: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

function formatDateShort(value: string | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("lo-LA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function SalesReportPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultThisWeek);
  const { data, loading, error, fetchReport } = useReport();
  const { user: shop } = useCurrentUser();

  useEffect(() => {
    fetchReport(dateRange.from, dateRange.to);
  }, [dateRange, fetchReport]);

  const profit = data?.profit;

  const handlePrint = () => {
    window.print();
  };

  const kpis = useMemo(
    () => [
      {
        key: "revenue",
        label: "ລາຍຮັບລວມ",
        value: `₭ ${formatMoney(profit?.grossRevenue)}`,
        sub: "ຍອດຂາຍກ່ອນຫັກຕົ້ນທຶນ",
        grad: "from-emerald-600 to-emerald-700",
      },
      {
        key: "cost",
        label: "ຕົ້ນທຶນລວມ",
        value: `₭ ${formatMoney(profit?.totalCost)}`,
        sub: "ຕົ້ນທຶນສິນຄ້າທີ່ຂາຍ",
        grad: "from-slate-600 to-slate-700",
      },
      {
        key: "profit",
        label: "ກຳໄລສຸດທິ",
        value: `₭ ${formatMoney(profit?.netProfit)}`,
        sub: `ອັດຕາກຳໄລ ${formatMoney(profit?.profitMargin)}%`,
        grad: "from-teal-600 to-cyan-700",
      },
      {
        key: "orders",
        label: "ຈຳນວນອໍເດີ",
        value: `${profit?.totalOrders ?? 0}`,
        sub: "ລາຍການຂາຍທັງໝົດ",
        grad: "from-indigo-600 to-violet-700",
      },
    ],
    [profit],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 no-print">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ລາຍງານການຂາຍ</h1>
            <p className="text-sm text-gray-500 mt-1">
              ສະຫຼຸບຍອດຂາຍ ກຳໄລ ແລະ ສິນຄ້າຂາຍດີ ກອງຕາມຊ່ວງວັນທີ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker value={dateRange} onChange={(v) => setDateRange(v)} />
            {!(dateRange.from === defaultThisWeek().from && dateRange.to === defaultThisWeek().to) && (
              <button
                onClick={() => setDateRange(defaultThisWeek())}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                title="ລ້າງວັນທີ"
              >
                ✕
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={loading || !data}
              className="flex items-center gap-2 px-4 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="ພິມລາຍງານ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              ພິມລາຍງານ
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k) => (
            <article
              key={k.key}
              className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-sm bg-gradient-to-br ${k.grad}`}
            >
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{k.label}</p>
                  <p className="text-2xl font-bold mt-2">{loading ? "…" : k.value}</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/20">{KPI_ICONS[k.key]}</div>
              </div>
              <div className="relative mt-3 text-xs font-medium opacity-80">{k.sub}</div>
            </article>
          ))}
        </section>

        {error && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-rose-600">
              <div className="text-3xl">⚠️</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment breakdown */}
          <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">💳 ການຊຳລະເງິນ</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {!loading && (data?.paymentBreakdown ?? []).length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">ບໍ່ມີຂໍ້ມູນ</div>
              )}
              {(data?.paymentBreakdown ?? []).map((p, i) => (
                <div key={`${p.paymentMethod}-${p.currency}-${i}`} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.paymentMethod}</div>
                    <div className="text-xs text-gray-500">
                      {p.currency} · {p.transactionCount} ຄັ້ງ · {formatMoney(p.percentage)}%
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-800">{formatMoney(p.totalAmount)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Order status */}
          <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">📦 ສະຖານະອໍເດີ</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {!loading && (data?.orderStatus ?? []).length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">ບໍ່ມີຂໍ້ມູນ</div>
              )}
              {(data?.orderStatus ?? []).map((o) => {
                const meta = statusMeta(o.status);
                return (
                  <div key={o.status} className="px-5 py-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
                      {meta.label}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{o.count} ອໍເດີ</div>
                      <div className="text-xs text-gray-500">
                        ₭ {formatMoney(o.totalAmount)} · {formatMoney(o.percentage)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Receipts table */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">🧾 ໃບບິນຂາຍ</h2>
            <span className="text-xs text-gray-500">{data?.receipts?.length ?? 0} ໃບ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="px-5 py-3 font-medium">ວັນທີ</th>
                  <th className="px-5 py-3 font-medium">ລູກຄ້າ</th>
                  <th className="px-5 py-3 font-medium">ພະນັກງານ</th>
                  <th className="px-5 py-3 font-medium text-center">ລາຍການ</th>
                  <th className="px-5 py-3 font-medium text-right">ຍອດລວມ</th>
                  <th className="px-5 py-3 font-medium text-center">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">ກຳລັງໂຫຼດຂໍ້ມູນ…</td>
                  </tr>
                )}
                {!loading && (data?.receipts ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">📭 ບໍ່ມີໃບບິນໃນຊ່ວງເວລານີ້</td>
                  </tr>
                )}
                {!loading &&
                  (data?.receipts ?? []).map((r) => {
                    const meta = statusMeta(r.status);
                    return (
                      <tr key={r.saleId} className="hover:bg-emerald-50/40">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.saleDate)}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">{r.customerName || "Guest"}</td>
                        <td className="px-5 py-3 text-gray-600">{r.staffName || "-"}</td>
                        <td className="px-5 py-3 text-center text-gray-600">{r.items?.length ?? 0}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                          ₭ {formatMoney(r.totalAmount)}
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

      {/* ─── Printable document (hidden on screen, shown only when printing) ─── */}
      <div className="print-only hidden">
        {/* Shop identity */}
        <div className="flex items-start justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-3">
            {shop?.profileImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.profileImageUrl} alt="logo" className="print-logo" />
            )}
            <div>
              <p className="text-base font-bold">{shop?.shopName || "ຮ້ານຄ້າ"}</p>
              {shop?.phoneNumber && <p className="text-xs">ໂທ: {shop.phoneNumber}</p>}
              {shop?.email && <p className="text-xs">ອີເມວ: {shop.email}</p>}
            </div>
          </div>
          <p className="text-xs text-right">
            ພິມວັນທີ: {formatDate(new Date().toISOString())}
          </p>
        </div>

        {/* Document title */}
        <div className="text-center mt-4">
          <h1 className="text-xl font-bold">ລາຍງານການຂາຍ / Sales Report</h1>
          <p className="text-sm mt-1">
            ຊ່ວງວັນທີ: {formatDateShort(dateRange.from)} — {formatDateShort(dateRange.to)}
          </p>
        </div>

        {/* Summary */}
        <table className="print-table mt-6">
          <tbody>
            <tr>
              <td className="font-semibold">ລາຍຮັບລວມ</td>
              <td className="text-right">₭ {formatMoney(profit?.grossRevenue)}</td>
              <td className="font-semibold">ຈຳນວນອໍເດີ</td>
              <td className="text-right">{profit?.totalOrders ?? 0}</td>
            </tr>
            <tr>
              <td className="font-semibold">ຕົ້ນທຶນລວມ</td>
              <td className="text-right">₭ {formatMoney(profit?.totalCost)}</td>
              <td className="font-semibold">ອັດຕາກຳໄລ</td>
              <td className="text-right">{formatMoney(profit?.profitMargin)}%</td>
            </tr>
            <tr>
              <td className="font-semibold">ກຳໄລສຸດທິ</td>
              <td className="text-right">₭ {formatMoney(profit?.netProfit)}</td>
              <td />
              <td />
            </tr>
          </tbody>
        </table>

        {/* Receipts */}
        <table className="print-table mt-6">
          <thead>
            <tr>
              <th>ວັນທີ</th>
              <th>ລູກຄ້າ</th>
              <th>ພະນັກງານ</th>
              <th className="text-center">ລາຍການ</th>
              <th className="text-right">ຍອດລວມ</th>
              <th className="text-center">ສະຖານະ</th>
            </tr>
          </thead>
          <tbody>
            {(data?.receipts ?? []).map((r) => (
              <tr key={r.saleId}>
                <td>{formatDate(r.saleDate)}</td>
                <td>{r.customerName || "Guest"}</td>
                <td>{r.staffName || "-"}</td>
                <td className="text-center">{r.items?.length ?? 0}</td>
                <td className="text-right">₭ {formatMoney(r.totalAmount)}</td>
                <td className="text-center">{statusMeta(r.status).label}</td>
              </tr>
            ))}
            {(data?.receipts ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">ບໍ່ມີໃບບິນໃນຊ່ວງເວລານີ້</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="text-right font-semibold">ລວມທັງໝົດ / Total</td>
              <td className="text-right font-semibold">₭ {formatMoney(profit?.grossRevenue)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <p className="text-xs mt-8">ເອກະສານນີ້ອອກຈາກລະບົບ POS ໂດຍອັດຕະໂນມັດ</p>
      </div>

      <style jsx global>{`
        .print-only {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only,
          .print-only * {
            visibility: visible;
          }
          .print-only {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 24px;
            color: #000;
            font-size: 12px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #999;
            padding: 6px 8px;
            text-align: left;
          }
          .print-table thead {
            background: #eee;
          }
          .print-logo {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 6px;
          }
          @page {
            size: A4;
            margin: 16mm;
          }
        }
      `}</style>
    </div>
  );
}
