"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "@/src/features/dashboard/useDashboard";
import { useSales, type SaleRecord } from "@/src/features/sale/useSale";
import { RefreshIcon } from "@/src/components/icons/page";

type ChartView = "month" | "week";

const COLORS = {
  app: "#3b82f6", // blue
  pos: "#10b981", // emerald
  appLight: "#dbeafe",
  posLight: "#d1fae5",
};

const formatMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US");

const compactMoney = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const formatDayKey = (d: Date) => d.toISOString().slice(0, 10);

const formatDate = (value: string | number | undefined) => {
  if (!value) return "";
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
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function DashboardPage() {
  const { data, loading: dashLoading, error: dashError, refetch } = useDashboard();
  const { sales, refetch: refetchSales } = useSales();
  const [chartView, setChartView] = useState<ChartView>("month");

  // ─── Channel breakdown (client-side) ───────────────────────
  const channelStats = useMemo(() => {
    const today = startOfToday().getTime();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStartMs = monthStart.getTime();

    let todayApp = 0,
      todayPos = 0,
      todayAppOrders = 0,
      todayPosOrders = 0;
    let monthApp = 0,
      monthPos = 0,
      monthAppOrders = 0,
      monthPosOrders = 0;

    // Daily buckets for the last 14 days, both channels.
    const days: Record<string, { app: number; pos: number; appOrders: number; posOrders: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days[formatDayKey(d)] = { app: 0, pos: 0, appOrders: 0, posOrders: 0 };
    }

    for (const sale of sales) {
      const ts =
        typeof sale.saleDate === "string" && /^\d+$/.test(sale.saleDate)
          ? Number(sale.saleDate)
          : new Date(sale.saleDate).getTime();
      if (isNaN(ts)) continue;
      const isApp = sale.source === "PLENT_APP";
      const amount = Number(sale.totalAmount || 0);
      const day = formatDayKey(new Date(ts));

      if (ts >= today) {
        if (isApp) {
          todayApp += amount;
          todayAppOrders++;
        } else {
          todayPos += amount;
          todayPosOrders++;
        }
      }
      if (ts >= monthStartMs) {
        if (isApp) {
          monthApp += amount;
          monthAppOrders++;
        } else {
          monthPos += amount;
          monthPosOrders++;
        }
      }
      if (day in days) {
        if (isApp) {
          days[day].app += amount;
          days[day].appOrders++;
        } else {
          days[day].pos += amount;
          days[day].posOrders++;
        }
      }
    }

    const dailyChannel = Object.entries(days).map(([date, v]) => ({
      name: date.slice(5),
      ມືຖື: v.app,
      POS: v.pos,
      mobileOrders: v.appOrders,
      posOrders: v.posOrders,
    }));

    return {
      todayApp,
      todayPos,
      todayAppOrders,
      todayPosOrders,
      monthApp,
      monthPos,
      monthAppOrders,
      monthPosOrders,
      dailyChannel,
    };
  }, [sales]);

  // Refresh both endpoints together.
  const handleRefresh = () => {
    refetch();
    refetchSales();
  };

  // Poll sales every 30s so the dashboard reflects new mobile orders.
  useEffect(() => {
    const id = window.setInterval(() => refetchSales(), 30_000);
    return () => window.clearInterval(id);
  }, [refetchSales]);

  // Aggregate sales chart (existing data)
  const chartData = data
    ? chartView === "month"
      ? data.dailyStats.map((d) => ({
          name: d.date.slice(5),
          ຍອດຂາຍ: d.totalSales,
          ອໍເດີ: d.orderCount,
        }))
      : data.weeklyStats.map((d) => ({
          name: d.date,
          ຍອດຂາຍ: d.totalSales,
          ອໍເດີ: d.orderCount,
        }))
    : [];

  const pieData = [
    {
      name: "ມືຖື (App)",
      value: channelStats.monthApp,
      orders: channelStats.monthAppOrders,
      color: COLORS.app,
    },
    {
      name: "POS",
      value: channelStats.monthPos,
      orders: channelStats.monthPosOrders,
      color: COLORS.pos,
    },
  ];
  const monthTotal = channelStats.monthApp + channelStats.monthPos;

  // Recent orders — last 8, mixed source
  const recentOrders = useMemo(
    () =>
      [...sales]
        .sort((a, b) => {
          const at =
            typeof a.saleDate === "string" && /^\d+$/.test(a.saleDate)
              ? Number(a.saleDate)
              : new Date(a.saleDate).getTime();
          const bt =
            typeof b.saleDate === "string" && /^\d+$/.test(b.saleDate)
              ? Number(b.saleDate)
              : new Date(b.saleDate).getTime();
          return bt - at;
        })
        .slice(0, 8),
    [sales],
  );

  if (dashLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <span className="text-sm">ກຳລັງໂຫຼດ…</span>
      </div>
    );
  }

  if (dashError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-rose-600">
        <div className="text-3xl">⚠️</div>
        <div className="text-sm">{dashError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ລາຍງານພາບລວວມ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ສະຫຼຸບການຂາຍ ແລະ ປຽບທຽບລະຫວ່າງມືຖື ກັບ POS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ມື້ນີ້
              </div>
              <div className="text-xl font-bold text-gray-900">
                ₭ {formatMoney(data?.todaySales ?? 0)}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition"
              title="Refresh"
            >
              <RefreshIcon size={18} />
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="ມືຖື (App)"
            value={`₭ ${formatMoney(channelStats.todayApp)}`}
            sub={`${channelStats.todayAppOrders} ອໍເດີມື້ນີ້`}
            color="blue"
            icon="📱"
          />
          <KpiCard
            title="POS / ໜ້າຮ້ານ"
            value={`₭ ${formatMoney(channelStats.todayPos)}`}
            sub={`${channelStats.todayPosOrders} ບິນມື້ນີ້`}
            color="emerald"
            icon="💻"
          />
          <KpiCard
            title="ຍອດອາທິດ"
            value={`₭ ${formatMoney(data?.weekSales ?? 0)}`}
            sub={`${data?.weekOrders ?? 0} ອໍເດີ`}
            color="purple"
            icon="📈"
          />
          <KpiCard
            title="ສິນຄ້າ"
            value={String(data?.totalProducts ?? 0)}
            sub={`${data?.lowStockCount ?? 0} ໃກ້ໝົດ`}
            color={data && data.lowStockCount > 0 ? "rose" : "slate"}
            icon="🌱"
          />
        </section>

        {/* Channel split charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Stacked bar — daily by channel (last 14 days) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  ຍອດຂາຍຕາມຊ່ອງທາງ
                </h2>
                <p className="text-xs text-gray-500">14 ມື້ຫລ້າສຸດ</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ background: COLORS.app }}
                  />
                  ມືຖື
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ background: COLORS.pos }}
                  />
                  POS
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelStats.dailyChannel}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tickFormatter={compactMoney}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `₭ ${formatMoney(v)}`}
                  />
                  <Bar
                    dataKey="ມືຖື"
                    stackId="a"
                    fill={COLORS.app}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="POS"
                    stackId="a"
                    fill={COLORS.pos}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut — month share */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              ສ່ວນແບ່ງເດືອນນີ້
            </h2>
            <p className="text-xs text-gray-500">ມືຖື vs POS</p>

            <div className="relative h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `₭ ${formatMoney(v)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                  ລວມ
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ₭ {compactMoney(monthTotal)}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {pieData.map((d) => {
                const pct =
                  monthTotal > 0
                    ? Math.round((d.value / monthTotal) * 100)
                    : 0;
                return (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ background: d.color }}
                    />
                    <span className="flex-1 text-sm text-gray-700">
                      {d.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {pct}%
                    </span>
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {d.orders}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Aggregate sales chart (existing data) */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                ຍອດຂາຍລວມ
              </h2>
              <p className="text-xs text-gray-500">
                {chartView === "month" ? "30 ມື້ຫລ້າສຸດ" : "7 ອາທິດຫລ້າສຸດ"}
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setChartView("month")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartView === "month"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                ມື້
              </button>
              <button
                onClick={() => setChartView("week")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  chartView === "week"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                ອາທິດ
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  tickFormatter={compactMoney}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `₭ ${formatMoney(v)}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="ຍອດຂາຍ"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#salesArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Bottom row: top products + recent orders */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              ສິນຄ້າຂາຍດີ
            </h2>
            <p className="text-xs text-gray-500 mb-4">5 ອັນດັບສູງສຸດ</p>
            <div className="space-y-3">
              {data?.topProducts?.slice(0, 5).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      🌱
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ຂາຍແລ້ວ {p.totalQuantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    ₭ {formatMoney(p.totalRevenue)}
                  </span>
                </div>
              ))}
              {(!data?.topProducts || data.topProducts.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">
                  ຍັງບໍ່ມີຂໍ້ມູນ
                </p>
              )}
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              ອໍເດີຫລ້າສຸດ
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              ປະສົມມືຖື ກັບ POS
            </p>
            <div className="space-y-2">
              {recentOrders.map((order: SaleRecord) => {
                const isApp = order.source === "PLENT_APP";
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span
                      className={`shrink-0 w-2 h-10 rounded-full ${
                        isApp ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-700 px-1.5 py-0.5 rounded bg-gray-100">
                          {order.code ||
                            order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            isApp
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isApp ? "📱 ມືຖື" : "💻 POS"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.saleDate)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₭ {formatMoney(order.totalAmount)}
                    </span>
                  </div>
                );
              })}
              {recentOrders.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  ຍັງບໍ່ມີອໍເດີ
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  color: "blue" | "emerald" | "purple" | "rose" | "slate";
  icon: string;
}) {
  const palette = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      blob: "bg-blue-300",
      label: "text-blue-800",
      value: "text-blue-900",
      sub: "text-blue-700/80",
    },
    emerald: {
      bg: "from-emerald-50 to-emerald-100",
      blob: "bg-emerald-300",
      label: "text-emerald-800",
      value: "text-emerald-900",
      sub: "text-emerald-700/80",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      blob: "bg-purple-300",
      label: "text-purple-800",
      value: "text-purple-900",
      sub: "text-purple-700/80",
    },
    rose: {
      bg: "from-rose-50 to-rose-100",
      blob: "bg-rose-300",
      label: "text-rose-800",
      value: "text-rose-900",
      sub: "text-rose-700/80",
    },
    slate: {
      bg: "from-slate-50 to-slate-100",
      blob: "bg-slate-300",
      label: "text-slate-700",
      value: "text-slate-900",
      sub: "text-slate-500",
    },
  }[color];

  return (
    <article
      className={`relative overflow-hidden rounded-3xl p-5 shadow-sm bg-gradient-to-br ${palette.bg}`}
    >
      <div
        className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 ${palette.blob}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${palette.label}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${palette.value}`}>{value}</p>
          <p className={`text-xs mt-1 ${palette.sub}`}>{sub}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </article>
  );
}
