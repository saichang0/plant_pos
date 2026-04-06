"use client";

import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useDashboard } from '@/src/features/dashboard/useDashboard';
import { WarningIcon, RefreshIcon } from '@/src/components/icons/page';

type ChartView = 'month' | 'week';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard();
  const [chartView, setChartView] = useState<ChartView>('month');

  const formatPrice = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  };

  const statsCards = data
    ? [
        { label: 'ຍອດຂາຍມື້ນີ້', value: `₭ ${data.todaySales.toLocaleString()}`, sub: `${data.todayOrders} ອໍເດີ`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
        { label: 'ຍອດຂາຍອາທິດນີ້', value: `₭ ${data.weekSales.toLocaleString()}`, sub: `${data.weekOrders} ອໍເດີ`, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
        { label: 'ຍອດຂາຍເດືອນນີ້', value: `₭ ${data.monthSales.toLocaleString()}`, sub: `${data.monthOrders} ອໍເດີ`, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
        { label: 'ສິນຄ້າທັງໝົດ', value: data.totalProducts.toLocaleString(), sub: `${data.lowStockCount} ໃກ້ໝົດ`, color: data.lowStockCount > 0 ? 'text-red-700' : 'text-gray-700', bg: data.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200' },
      ]
    : [];

  const chartData = data
    ? chartView === 'month'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ໜ້າຫຼັກ</h1>
          <p className="text-gray-500 mt-1">ສະຫຼຸບຂໍ້ມູນລະບົບ Plant POS</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div key={i} className={`rounded-2xl p-5 shadow-sm border ${card.bg}`}>
            <p className="text-xs uppercase tracking-wide mb-2 text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">ຍອດຂາຍ</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartView('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                30 ມື້
              </button>
              <button
                onClick={() => setChartView('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  chartView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                8 ອາທິດ
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatPrice} />
              {/* <Tooltip
                formatter={(value: number) => [`₭ ${value.toLocaleString()}`, 'ຍອດຂາຍ']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              /> */}
              <Area
                type="monotone"
                dataKey="ຍອດຂາຍ"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart - Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">ຈຳນວນອໍເດີ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
              <Bar dataKey="ອໍເດີ" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">ສິນຄ້າຂາຍດີ</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">ຍັງບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((product, index) => {
                const maxRevenue = data.topProducts[0]?.totalRevenue || 1;
                const barWidth = (product.totalRevenue / maxRevenue) * 100;

                return (
                  <div key={product.productId} className="flex items-center gap-4">
                    <span className="w-6 text-sm font-bold text-gray-400 text-right">{index + 1}</span>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm font-bold text-gray-900 ml-2">₭ {product.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.totalQuantity} ອັນ</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {/* Pending POs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">ໃບສັ່ງຊື້ລໍຖ້າ</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-orange-600">{data.pendingPurchaseOrders}</p>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 text-lg font-bold">PO</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className={`rounded-2xl border shadow-sm p-5 ${data.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">ສິນຄ້າໃກ້ໝົດ</p>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold ${data.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {data.lowStockCount}
              </p>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <WarningIcon size={24} className={data.lowStockCount > 0 ? 'text-red-500' : 'text-green-500'} />
              </div>
            </div>
            {data.lowStockCount > 0 && (
              <p className="text-xs text-red-600 mt-2">ຕ້ອງການສັ່ງຊື້ເພີ່ມ</p>
            )}
          </div>

          {/* Month Summary */}
          <div className="bg-emerald-900 rounded-2xl shadow-sm p-5 text-white">
            <p className="text-xs uppercase tracking-wide text-emerald-300 mb-2">ສະຫຼຸບເດືອນນີ້</p>
            <p className="text-2xl font-bold">₭ {data.monthSales.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-700">
              <div>
                <p className="text-xs text-emerald-300">ອໍເດີ</p>
                <p className="text-lg font-bold">{data.monthOrders}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-300">ສະເລ່ຍ/ອໍເດີ</p>
                <p className="text-lg font-bold">
                  ₭ {data.monthOrders > 0 ? Math.round(data.monthSales / data.monthOrders).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
