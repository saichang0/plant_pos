"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useProducts,
  useCategories,
  useDeleteProduct,
} from "@/src/features/stock/useProduct";
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  WarningIcon,
  EditIcon,
  TrashIcon,
} from "@/src/components/icons/page";
import { useToast } from "@/src/components/toast";
import { FaPlus } from "react-icons/fa";

const formatMoney = (n: number | string | undefined) =>
  Number(n || 0).toLocaleString("en-US");

export default function StockPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { products, loading, error, refetch } = useProducts();
  const { categories } = useCategories();
  const { submitting: deleting, deleteProduct } = useDeleteProduct();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(
    null,
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Active" | "Inactive">(
    "all",
  );
  const [selectedOffer, setSelectedOffer] = useState<"all" | "special" | "normal">(
    "all",
  );
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setShowStatusDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "-";

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory)
        return false;
      if (selectedStatus === "Active" && !p.isActive) return false;
      if (selectedStatus === "Inactive" && p.isActive) return false;
      if (selectedOffer === "special" && !p.isSpecialOffer) return false;
      if (selectedOffer === "normal" && p.isSpecialOffer) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedOffer]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const special = products.filter((p) => p.isSpecialOffer).length;
    const outOfStock = products.filter(
      (p) => p.stockQuantity === 0 && Number(p.stockWeight) === 0,
    ).length;
    return { total, active, special, outOfStock };
  }, [products]);

  const statusLabel = {
    all: "ສະຖານະທັງໝົດ",
    Active: "Active",
    Inactive: "Inactive",
  }[selectedStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ສິນຄ້າທັງໝົດ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ສະຫຼຸບ ແລະ ບໍລິຫານສິນຄ້າໃນຮ້ານ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ສະແດງ
              </div>
              <div className="text-xl font-bold text-gray-900">
                {filteredProducts.length}
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/addPlant")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition"
            >
              <FaPlus className="w-3.5 h-3.5" />
              ເພີ່ມສິນຄ້າ
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="ສິນຄ້າທັງໝົດ"
            value={String(stats.total)}
            sub="ໃນຄັງ"
            color="emerald"
            icon="🌱"
          />
          <KpiCard
            title="Active"
            value={String(stats.active)}
            sub="ເປີດຂາຍ"
            color="blue"
            icon="✓"
          />
          {/* <KpiCard
            title="ສ່ວນຫຼຸດ"
            value={String(stats.special)}
            sub="ສິນຄ້າພິເສດ"
            color="orange"
            icon="🏷️"
          /> */}
          <KpiCard
            title="ໝົດສະຕ໋ອກ"
            value={String(stats.outOfStock)}
            sub="ຄວນເຕີມ"
            color={stats.outOfStock > 0 ? "rose" : "slate"}
            icon="⚠️"
          />
        </section>

        {/* Filter bar */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div className="relative w-full lg:w-80">
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

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              {/* Status dropdown */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedStatus === "all"
                        ? "bg-gray-400"
                        : selectedStatus === "Active"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                    }`}
                  />
                  <span className="text-gray-700">{statusLabel}</span>
                  {showStatusDropdown ? (
                    <ArrowUpIcon size={16} className="text-gray-500" />
                  ) : (
                    <ArrowDownIcon size={16} className="text-gray-500" />
                  )}
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {(["all", "Active", "Inactive"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedStatus(s);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 ${
                          selectedStatus === s
                            ? "text-emerald-700 font-medium bg-emerald-50"
                            : "text-gray-700"
                        }`}
                      >
                        {s === "all" ? "ສະຖານະທັງໝົດ" : s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset */}
              {(searchQuery ||
                selectedCategory !== "all" ||
                selectedStatus !== "all" ||
                selectedOffer !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                    setSelectedOffer("all");
                  }}
                  className="px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
                >
                  ລ້າງ
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <CategoryPill
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              label="ໝວດໝູ່ທັງໝົດ"
              count={products.length}
            />
            {categories.map((cat) => {
              const c = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <CategoryPill
                  key={cat.id}
                  active={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  label={cat.name}
                  count={c}
                />
              );
            })}
          </div>

          {/* Offer toggles */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(
              [
                { key: "all", label: "ທັງໝົດ" },
                { key: "special", label: "ສ່ວນຫຼຸດ" },
                { key: "normal", label: "ປົກກະຕິ" },
              ] as const
            ).map((o) => {
              const active = selectedOffer === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setSelectedOffer(o.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    active
                      ? o.key === "special"
                        ? "bg-orange-500 text-white"
                        : "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* List */}
        <section className="space-y-2">
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
          ) : filteredProducts.length === 0 ? (
            <Empty>
              <div className="text-6xl">📦</div>
              <div className="text-sm text-gray-400">ບໍ່ມີສິນຄ້າ</div>
            </Empty>
          ) : (
            filteredProducts.map((p) => {
              const inStock = p.stockQuantity > 0 || Number(p.stockWeight) > 0;
              return (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      !p.isActive
                        ? "bg-gray-400"
                        : inStock
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                    }`}
                  />
                  <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="shrink-0 w-14 h-14 rounded-xl object-cover bg-gray-50 ring-1 ring-white"
                      />
                    ) : (
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl ring-1 ring-white">
                        🌱
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">
                          {p.name}
                        </span>
                        {/* {p.isSpecialOffer && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-orange-500">
                            ສ່ວນຫຼຸດ
                          </span>;
                        )} */}
                        {p.isPopular && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-blue-500">
                            ຂາຍດີ
                          </span>
                        )}
                        {!p.isActive && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-700 bg-gray-200">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {getCategoryName(p.categoryId)}
                        </span>
                        {p.size && <span>📏 {p.size}</span>}
                        <span>
                          <span className="text-gray-400">ຕົ້ນທຶນ:</span>{" "}
                          <span className="text-gray-700 font-medium">
                            ₭ {formatMoney(p.costPrice)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ສະຕ໋ອກ
                      </p>
                      <span
                        className={`text-lg font-bold ${
                          inStock ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {p.stockQuantity}
                      </span>
                      {Number(p.stockWeight) > 0 && (
                        <span className="text-[10px] text-gray-500">
                          ({(Number(p.stockWeight) / 1000).toFixed(1)} kg)
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        ລາຄາຂາຍ
                      </p>
                      <p className="text-base font-bold text-emerald-700">
                        ₭ {formatMoney(p.salePrice)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/stock/update?id=${p.id}`)
                        }
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                        title="ແກ້ໄຂ"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ id: p.id, name: p.name })
                        }
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                        title="ລຶບ"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                <WarningIcon className="w-7 h-7 text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ຢືນຢັນການລຶບ
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ລຶບສິນຄ້າ{" "}
              <span className="font-semibold text-gray-800">
                &quot;{deleteConfirm.name}&quot;
              </span>{" "}
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={async () => {
                  const result = await deleteProduct(deleteConfirm.id);
                  if (result.success) {
                    showToast("ລຶບສິນຄ້າສຳເລັດ", "success");
                    setDeleteConfirm(null);
                    refetch();
                  } else {
                    showToast(result.message, "error");
                  }
                }}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "ກຳລັງລຶບ…" : "ລຶບ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
          active ? "bg-white/20" : "bg-white text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
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
  color: "emerald" | "blue" | "orange" | "rose" | "slate";
  icon: string;
}) {
  const palette = {
    emerald: {
      bg: "from-emerald-50 to-emerald-100",
      blob: "bg-emerald-300",
      label: "text-emerald-800",
      value: "text-emerald-900",
      sub: "text-emerald-700/80",
    },
    blue: {
      bg: "from-blue-50 to-blue-100",
      blob: "bg-blue-300",
      label: "text-blue-800",
      value: "text-blue-900",
      sub: "text-blue-700/80",
    },
    orange: {
      bg: "from-orange-50 to-amber-100",
      blob: "bg-orange-300",
      label: "text-orange-800",
      value: "text-orange-900",
      sub: "text-orange-700/80",
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
