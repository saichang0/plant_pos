"use client";

import { useState, useEffect } from "react";
import { useReport, type Receipt } from "@/src/features/report/useReport";
import { BackIcon, DotThreeIcon } from "@/src/components/icons/page";

const formatPrice = (n: number) => n.toLocaleString("en-US");

const statusLabels: Record<string, string> = {
  paid: "ຈ່າຍແລ້ວ",
  completed: "ສຳເລັດ",
  pending: "ລໍຖ້າ",
  cancelled: "ຍົກເລີກ",
  draft: "ຮ່າງ",
};

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-600",
};

export default function ReportsPage() {
  const { data, loading, error, fetchReport } = useReport();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, []);

  const handleFilter = () => fetchReport(startDate, endDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">ກຳລັງໂຫຼດລາຍງານ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Date Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ລາຍງານ</h1>
          <p className="text-slate-500 mt-1">ສະຫຼຸບຂໍ້ມູນການຂາຍ</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <button
            onClick={handleFilter}
            className="px-5 py-2 bg-emerald-900 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
          >
            ກັ່ນຕອງ
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* ═══════════════════════════════════════════════ */}
          {/* 1. Net Profit vs Gross Revenue */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">ລາຍຮັບລວມ</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatPrice(data.profit.grossRevenue)} ₭</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">ຕົ້ນທຶນ</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatPrice(data.profit.totalCost)} ₭</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">ກຳໄລສຸດທິ</p>
              <p className={`text-2xl font-bold mt-1 ${data.profit.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatPrice(data.profit.netProfit)} ₭
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">ອັດຕາກຳໄລ</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{data.profit.profitMargin}%</p>
              <p className="text-xs text-gray-400 mt-1">{data.profit.totalOrders} ອໍເດີ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══════════════════════════════════════════════ */}
            {/* 2. Top Selling Products */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ສິນຄ້າຂາຍດີ</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">#</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ສິນຄ້າ</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">ຈຳນວນ</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">ລາຍຮັບ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topProducts.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.categoryName}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-right text-gray-600">
                          {formatPrice(p.totalQuantity)} {p.unitName}
                        </td>
                        <td className="px-5 py-3 text-sm text-right font-semibold text-gray-800">
                          {formatPrice(p.totalRevenue)} ₭
                        </td>
                      </tr>
                    ))}
                    {data.topProducts.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">ບໍ່ມີຂໍ້ມູນ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 3. Sales by Category */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ຍອດຂາຍຕາມໝວດໝູ່</h2>
              </div>
              <div className="p-5 space-y-4">
                {data.salesByCategory.map((cat) => (
                  <div key={cat.categoryId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.categoryName}</span>
                      <span className="text-sm text-gray-500">{formatPrice(cat.totalRevenue)} ₭ ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{cat.totalOrders} ອໍເດີ</p>
                  </div>
                ))}
                {data.salesByCategory.length === 0 && (
                  <p className="text-center text-gray-400 py-8">ບໍ່ມີຂໍ້ມູນ</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══════════════════════════════════════════════ */}
            {/* 4. Payment Method Breakdown */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ວິທີຊຳລະ</h2>
              </div>
              <div className="p-5 space-y-3">
                {data.paymentBreakdown.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">{p.paymentMethod}</p>
                      <p className="text-xs text-gray-400">{p.transactionCount} ລາຍການ | {p.currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatPrice(p.totalAmount)} ₭</p>
                      <p className="text-xs text-gray-400">{p.percentage}%</p>
                    </div>
                  </div>
                ))}
                {data.paymentBreakdown.length === 0 && (
                  <p className="text-center text-gray-400 py-8">ບໍ່ມີຂໍ້ມູນ</p>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* 5. Order Status Summary */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">ສະຖານະອໍເດີ</h2>
              </div>
              <div className="p-5 space-y-3">
                {data.orderStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                      <span className="text-sm text-gray-600">{s.count} ອໍເດີ</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatPrice(s.totalAmount)} ₭</p>
                      <p className="text-xs text-gray-400">{s.percentage}%</p>
                    </div>
                  </div>
                ))}
                {data.orderStatus.length === 0 && (
                  <p className="text-center text-gray-400 py-8">ບໍ່ມີຂໍ້ມູນ</p>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* 6. Receipts */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">ໃບບິນ ({data.receipts.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ວັນທີ</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ລູກຄ້າ</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">ພະນັກງານ</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">ລາຍການ</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">ຍອດລວມ</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">ສະຖານະ</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">ເບິ່ງ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.receipts.map((r, i) => (
                    <tr key={r.saleId} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {new Date(r.saleDate).toLocaleDateString("lo-LA")}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{r.customerName || "-"}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{r.staffName || "-"}</td>
                      <td className="px-5 py-3 text-sm text-right text-gray-600">{r.items.length}</td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-gray-800">
                        {formatPrice(r.totalAmount)} ₭
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabels[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          ເບິ່ງ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.receipts.length === 0 && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">ບໍ່ມີໃບບິນ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Receipt Detail Panel (slide-in) */}
      {/* ═══════════════════════════════════════════════ */}
      {selectedReceipt && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSelectedReceipt(null)} />
          <aside className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl overflow-y-auto z-40">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => setSelectedReceipt(null)}
                    aria-label="Close"
                  >
                    <BackIcon size={24} />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ໃບບິນ #{selectedReceipt.saleId.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColors[selectedReceipt.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[selectedReceipt.status] || selectedReceipt.status}
                      </span>
                      {selectedReceipt.payments.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                          • ຊຳລະແລ້ວ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedReceipt.saleDate).toLocaleString("lo-LA")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ພິມ
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <DotThreeIcon size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              {/* Order Items */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">ລາຍການສິນຄ້າ</h4>
                  <span className="text-xs text-gray-500">{selectedReceipt.items.length} ລາຍການ</span>
                </div>

                <div className="space-y-3">
                  {selectedReceipt.items.map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-2xl shrink-0">
                          🌱
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-gray-900 truncate">{item.productName}</h5>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.weightGrams > 0
                              ? `${(item.weightGrams / 1000).toFixed(2)} kg`
                              : `${item.quantity} ${item.unitName || ""}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ລາຄາຕໍ່ໜ່ວຍ: {formatPrice(item.unitPrice)} ₭
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.totalPrice)} ₭
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order Summary */}
              <section>
                <h4 className="text-base font-semibold text-gray-900 mb-3">ສະຫຼຸບການຂາຍ</h4>

                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ລວມຍ່ອຍ</span>
                    <div className="text-right">
                      <span className="text-gray-500 mr-2">{selectedReceipt.items.length} ລາຍການ</span>
                      <span className="font-medium text-gray-900">{formatPrice(selectedReceipt.subTotal)} ₭</span>
                    </div>
                  </div>

                  {selectedReceipt.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ສ່ວນຫຼຸດ</span>
                      <span className="font-medium text-red-600">-{formatPrice(selectedReceipt.discountAmount)} ₭</span>
                    </div>
                  )}

                  {selectedReceipt.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ພາສີ</span>
                      <span className="font-medium text-gray-900">{formatPrice(selectedReceipt.taxAmount)} ₭</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">ຍອດລວມ</span>
                    <span className="font-bold text-gray-900">{formatPrice(selectedReceipt.totalAmount)} ₭</span>
                  </div>

                  {selectedReceipt.payments.length > 0 && (
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      <p className="text-xs font-medium text-gray-500">ການຊຳລະ</p>
                      {selectedReceipt.payments.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{p.method} ({p.currency})</span>
                          <span className="font-medium text-gray-900">{formatPrice(p.amount)} ₭</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Customer Details */}
              <section>
                <h4 className="text-base font-semibold text-gray-900 mb-3">ຂໍ້ມູນລູກຄ້າ & ພະນັກງານ</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">ລູກຄ້າ</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <span>👤</span> {selectedReceipt.customerName || "ລູກຄ້າທົ່ວໄປ"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">ພະນັກງານ</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <span>🧑‍💼</span> {selectedReceipt.staffName || "-"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
