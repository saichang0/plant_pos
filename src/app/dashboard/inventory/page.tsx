"use client";
import React, { useState, useMemo } from "react";
import {
  SearchIcon,
  WarningIcon,
  EditIcon,
  TrashIcon,
} from "@/src/components/icons/page";
import { useImports } from "@/src/features/import/useImport";
import { useToast } from "@/src/components/toast";
import { gqlFetch } from "@/src/lib/gqlFetch";
import {
  UPDATE_STOCK_DETAIL_MUTATION,
  DELETE_STOCK_DETAIL_MUTATION,
} from "@/src/apollo/import/mutation";
import { UPDATE_PRODUCT_MUTATION } from "@/src/apollo/product/mutation";

const LOW_STOCK_THRESHOLD = 5;

const formatMoney = (n: number) =>
  Number(n || 0).toLocaleString("en-US");

export default function InventoryPage() {
  const { imports, loading, error, refetch } = useImports();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "ok">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editQty, setEditQty] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number>(0);
  const [editProductId, setEditProductId] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Flatten received reception details
  const inventoryItems = useMemo(() => {
    return imports.flatMap((imp) =>
      imp.stockReceptionDetails
        .filter((d) => d.status === "received")
        .map((detail) => ({
          detailId: detail.id,
          productId: detail.productId,
          name: detail.product?.name || "-",
          imageUrl: detail.product?.imageUrl || "",
          salePrice: detail.product?.salePrice || 0,
          costPrice: Number(detail.actualCostPrice),
          quantity: detail.quantityReceived,
        })),
    );
  }, [imports]);

  const filtered = useMemo(() => {
    let items = inventoryItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
    }
    if (stockFilter === "low") {
      items = items.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD);
    } else if (stockFilter === "ok") {
      items = items.filter((i) => i.quantity > LOW_STOCK_THRESHOLD);
    }
    return items.sort((a, b) => a.quantity - b.quantity);
  }, [inventoryItems, searchQuery, stockFilter]);

  // Stats
  const totalProducts = inventoryItems.length;
  const totalQty = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = inventoryItems.filter(
    (i) => i.quantity <= LOW_STOCK_THRESHOLD,
  ).length;
  const totalValue = inventoryItems.reduce(
    (sum, i) => sum + i.salePrice * i.quantity,
    0,
  );

  const handleEditStart = (
    detailId: string,
    productId: string,
    currentQty: number,
    currentSalePrice: number,
  ) => {
    setEditingId(detailId);
    setEditProductId(productId);
    setEditQty(currentQty);
    setEditSalePrice(currentSalePrice);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const result = await gqlFetch(DELETE_STOCK_DETAIL_MUTATION, {
        input: { id: deleteConfirm.id },
      });
      const data = result.data?.deleteStockReceptionDetail;
      if (data?.status) {
        showToast("ລົບສຳເລັດແລ້ວ", "success");
        setDeleteConfirm(null);
        refetch();
      } else {
        showToast(data?.message || "ລົບບໍ່ສຳເລັດ", "error");
      }
    } catch {
      showToast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async (detailId: string) => {
    setSaving(true);
    try {
      const qtyResult = await gqlFetch(UPDATE_STOCK_DETAIL_MUTATION, {
        input: { id: detailId, data: { quantityReceived: editQty } },
      });
      if (qtyResult.errors) {
        showToast(qtyResult.errors[0].message, "error");
        return;
      }

      const priceResult = await gqlFetch(UPDATE_PRODUCT_MUTATION, {
        id: editProductId,
        input: { salePrice: editSalePrice },
      });
      if (priceResult.errors) {
        showToast(priceResult.errors[0].message, "error");
        return;
      }

      showToast("ອັບເດດສຳເລັດແລ້ວ", "success");
      setEditingId(null);
      setShowEditModal(false);
      refetch();
    } catch {
      showToast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ສາງສິນຄ້າ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ສະຫຼຸບສິນຄ້າຄົງຄັງ ແລະ ບໍລິຫານສະຕ໋ອກ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ສິນຄ້າ
              </div>
              <div className="text-xl font-bold text-gray-900">
                {totalProducts}
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm">
              <div className="text-[10px] uppercase tracking-wider opacity-80">
                ມູນຄ່າລວມ
              </div>
              <div className="text-xl font-bold">₭ {formatMoney(totalValue)}</div>
            </div>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="ສິນຄ້າທັງໝົດ"
            value={String(totalProducts)}
            sub={`${totalQty.toLocaleString()} ຫົວໜ່ວຍ`}
            color="emerald"
            icon="🌱"
          />
          <KpiCard
            title="ຈຳນວນລວມ"
            value={totalQty.toLocaleString()}
            sub="ຫົວໜ່ວຍຄົງເຫລືອ"
            color="blue"
            icon="📦"
          />
          <KpiCard
            title="ໃກ້ໝົດ"
            value={String(lowStockCount)}
            sub={`ໜ້ອຍກວ່າ ${LOW_STOCK_THRESHOLD}`}
            color={lowStockCount > 0 ? "rose" : "slate"}
            icon="⚠️"
          />
          <KpiCard
            title="ມູນຄ່າລວມ"
            value={`₭ ${formatMoney(totalValue)}`}
            sub="ຕາມລາຄາຂາຍ"
            color="purple"
            icon="💰"
          />
        </section>

        {/* Filter bar */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 lg:w-80 lg:flex-none">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
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

            <div className="hidden lg:block h-8 w-px bg-gray-200" />

            <div className="flex items-center gap-2 lg:ml-auto">
              {(
                [
                  { key: "all", label: "ທັງໝົດ", color: "emerald" },
                  { key: "low", label: "ໃກ້ໝົດ", color: "rose" },
                  { key: "ok", label: "ມີສະຕ໋ອກ", color: "emerald" },
                ] as const
              ).map((f) => {
                const active = stockFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setStockFilter(f.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      active
                        ? f.color === "rose"
                          ? "bg-rose-500 text-white shadow-sm"
                          : "bg-emerald-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Inventory list */}
        <section className="space-y-2">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <span className="text-sm">ກຳລັງໂຫຼດ…</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-100 py-16 text-center">
              <div className="flex flex-col items-center gap-2 text-rose-600">
                <div className="text-3xl">⚠️</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="text-6xl">📭</div>
                <div className="text-sm">ບໍ່ມີຂໍ້ມູນ</div>
              </div>
            </div>
          ) : (
            filtered.map((item) => {
              const isLowStock = item.quantity <= LOW_STOCK_THRESHOLD;
              const margin = item.salePrice - item.costPrice;
              return (
                <article
                  key={item.detailId}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                >
                  {/* Status accent bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isLowStock ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />

                  <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                    {/* Thumbnail */}
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="shrink-0 w-14 h-14 rounded-xl object-cover bg-gray-50 ring-1 ring-white"
                      />
                    ) : (
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl ring-1 ring-white">
                        🌱
                      </div>
                    )}

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-rose-500">
                            <WarningIcon size={10} /> ໃກ້ໝົດ
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span>
                          <span className="text-gray-400">ຕົ້ນທຶນ:</span>{" "}
                          <span className="text-gray-700 font-medium">
                            ₭ {formatMoney(item.costPrice)}
                          </span>
                        </span>
                        <span>
                          <span className="text-gray-400">ກຳໄລ/ຫົວ:</span>{" "}
                          <span
                            className={`font-medium ${
                              margin > 0 ? "text-emerald-700" : "text-rose-600"
                            }`}
                          >
                            ₭ {formatMoney(margin)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ຄົງເຫລືອ
                      </p>
                      <span
                        className={`text-lg font-bold ${
                          isLowStock ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ລາຄາຂາຍ
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        ₭ {formatMoney(item.salePrice)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleEditStart(
                            item.detailId,
                            item.productId,
                            item.quantity,
                            item.salePrice,
                          )
                        }
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                        title="ແກ້ໄຂ"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.detailId, item.name)}
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                        title="ລົບ"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {filtered.length > 0 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              ສະແດງ {filtered.length} ສິນຄ້າ
            </p>
          )}
        </section>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingId && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          onClick={() => {
            setShowEditModal(false);
            setEditingId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">ແກ້ໄຂຂໍ້ມູນ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຈຳນວນ
                </label>
                <input
                  type="number"
                  min={0}
                  value={editQty || ""}
                  onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ລາຄາຂາຍ
                </label>
                <input
                  type="number"
                  min={0}
                  value={editSalePrice || ""}
                  onChange={(e) =>
                    setEditSalePrice(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={() => handleEditSave(editingId)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
              >
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                <WarningIcon size={28} className="text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ຢືນຢັນການລົບ
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ທ່ານຕ້ອງການລົບ{" "}
              <span className="font-semibold text-gray-700">
                &quot;{deleteConfirm.name}&quot;
              </span>{" "}
              ບໍ?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "ກຳລັງລົບ..." : "ລົບ"}
              </button>
            </div>
          </div>
        </div>
      )}
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
