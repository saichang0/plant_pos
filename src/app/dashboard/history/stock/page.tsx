"use client";

import React, { useState } from "react";
import { useStockMovements } from "@/src/features/history/useHistory";

const REASON_OPTIONS = [
  { value: "", label: "ທັງໝົດ" },
  { value: "sale", label: "ການຂາຍ" },
  { value: "reception", label: "ຮັບສະຕ໋ອກ" },
  { value: "manual_edit", label: "ແກ້ໄຂມື" },
];

function reasonBadge(reason: string) {
  switch (reason) {
    case "sale":
      return "bg-red-100 text-red-700";
    case "reception":
      return "bg-emerald-100 text-emerald-700";
    case "manual_edit":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function reasonLabel(reason: string) {
  return REASON_OPTIONS.find((r) => r.value === reason)?.label || reason;
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

export default function StockHistoryPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  const { movements, total, loading, error } = useStockMovements({
    from: from || undefined,
    to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
    reason: reason || undefined,
    limit: 200,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ປະຫວດການແກ້ໄຂສະຕ໋ອກ
        </h1>
        <p className="text-gray-500">
          ບັນທຶກການປ່ຽນແປງສະຕ໋ອກທັງໝົດ (ການຂາຍ, ຮັບສິນຄ້າ, ແກ້ໄຂມື)
        </p>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ຈາກວັນທີ
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ຫາວັນທີ
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ປະເພດ
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFrom("");
                setTo("");
                setReason("");
              }}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ລ້າງຕົວກອງ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500">ຈຳນວນບັນທຶກ</div>
          <div className="text-2xl font-bold text-gray-800">{total}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500">ສິນຄ້າທີ່ເພີ່ມຂຶ້ນ</div>
          <div className="text-2xl font-bold text-emerald-700">
            +
            {movements
              .filter((m) => m.change > 0)
              .reduce((s, m) => s + m.change, 0)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500">ສິນຄ້າທີ່ຫຼຸດລົງ</div>
          <div className="text-2xl font-bold text-red-700">
            {movements
              .filter((m) => m.change < 0)
              .reduce((s, m) => s + m.change, 0)}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="p-10 text-center text-red-500">{error}</div>
        )}
        {!loading && !error && movements.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            ບໍ່ມີບັນທຶກການແກ້ໄຂສະຕ໋ອກ
          </div>
        )}
        {!loading && !error && movements.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">ວັນທີ</th>
                <th className="px-4 py-3 font-medium">ສິນຄ້າ</th>
                <th className="px-4 py-3 font-medium">ປະເພດ</th>
                <th className="px-4 py-3 font-medium text-right">ກ່ອນ</th>
                <th className="px-4 py-3 font-medium text-right">ປ່ຽນແປງ</th>
                <th className="px-4 py-3 font-medium text-right">ຫຼັງ</th>
                <th className="px-4 py-3 font-medium">ໝາຍເຫດ</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.product?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.product.imageUrl}
                          alt={m.product?.name || ""}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          {m.product?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {m.productId.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${reasonBadge(
                        m.reason,
                      )}`}
                    >
                      {reasonLabel(m.reason)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {m.quantityBefore}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      m.change > 0 ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {m.change > 0 ? `+${m.change}` : m.change}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {m.quantityAfter}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[260px] truncate">
                    {m.note || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
