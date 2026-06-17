"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@/src/components/icons/page";
import {
  useProducts,
  useCategories,
  Product,
} from "@/src/features/stock/useProduct";
import { useSuppliers } from "@/src/features/supplier/useSupplier";
import { useCreatePurchaseOrder } from "@/src/features/import/useImport";
import { useToast } from "@/src/components/toast";
import { FaPlus, FaMinus, FaTimes } from "react-icons/fa";

const formatMoney = (n: number | string | undefined) =>
  Number(n || 0).toLocaleString("en-US");

export default function PurchasePage() {
  const router = useRouter();
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  const { submitting, createPurchaseOrder } = useCreatePurchaseOrder();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(
    new Map(),
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node))
        setShowSupplierDropdown(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory)
        return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const toggleSelect = (p: Product) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.set(p.id, 1);
      return next;
    });
  };

  const changeQty = (id: string, delta: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const cur = next.get(id) || 1;
      const nv = Math.max(1, cur + delta);
      next.set(id, nv);
      return next;
    });
  };

  const setQty = (id: string, v: number) => {
    if (v < 1) return;
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.set(id, v);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const totalPrice = Array.from(selectedItems.entries()).reduce(
    (sum, [id, qty]) => {
      const p = products.find((x) => x.id === id);
      return sum + (p ? p.costPrice * qty : 0);
    },
    0,
  );

  const totalQty = Array.from(selectedItems.values()).reduce(
    (s, q) => s + q,
    0,
  );

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handlePurchaseClick = () => {
    if (selectedItems.size === 0) {
      showToast("ກະລຸນາເລືອກສິນຄ້າ", "warning");
      return;
    }
    if (!selectedSupplierId) {
      showToast("ກະລຸນາເລືອກຜູ້ສະໜອງ", "warning");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    const items = Array.from(selectedItems.entries()).map(([productId, quantity]) => {
      const p = products.find((x) => x.id === productId);
      return { productId, quantity, costPrice: p?.costPrice || 0 };
    });
    const result = await createPurchaseOrder(selectedSupplierId, items);
    setShowConfirmModal(false);
    if (result.success) {
      showToast("ສ້າງໃບສັ່ງຊື້ສຳເລັດແລ້ວ", "success");
      setSelectedItems(new Map());
      setSelectedSupplierId("");
      router.push("/dashboard/import");
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 pb-28 lg:pb-6 space-y-4">
        {/* Header */}
        <header className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 flex items-center justify-center transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              ສ້າງໃບສັ່ງຊື້
            </h1>
            <p className="text-xs text-gray-500">
              ເລືອກສິນຄ້າ ແລະ ກຳນົດຜູ້ສະໜອງ
            </p>
          </div>
        </header>

        {/* Grid layout — products left, cart right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* LEFT — products */}
          <section className="flex flex-col gap-3 min-w-0">
            {/* Search + supplier */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1">
                <SearchIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາສິນຄ້າ..."
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

              <div className="relative" ref={supplierRef}>
                <button
                  onClick={() => setShowSupplierDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition w-full sm:w-auto"
                >
                  <span className="text-gray-700 truncate max-w-[180px]">
                    {selectedSupplier ? `🏭 ${selectedSupplier.name}` : "ເລືອກຜູ້ສະໜອງ"}
                  </span>
                  {showSupplierDropdown ? (
                    <ArrowUpIcon size={16} className="text-gray-500 ml-auto" />
                  ) : (
                    <ArrowDownIcon size={16} className="text-gray-500 ml-auto" />
                  )}
                </button>
                {showSupplierDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-64 overflow-y-auto">
                    {suppliers.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        ບໍ່ມີຜູ້ສະໜອງ
                      </p>
                    )}
                    {suppliers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSupplierId(s.id);
                          setShowSupplierDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 ${
                          selectedSupplierId === s.id
                            ? "text-emerald-700 font-medium bg-emerald-50"
                            : "text-gray-700"
                        }`}
                      >
                        🏭 {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <CategoryPill
                active={selectedCategory === "all"}
                onClick={() => setSelectedCategory("all")}
                label="ທັງໝົດ"
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

            {/* Products list */}
            <div className="space-y-2">
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
              ) : filtered.length === 0 ? (
                <Empty>
                  <div className="text-6xl">📦</div>
                  <div className="text-sm text-gray-400">ບໍ່ມີສິນຄ້າ</div>
                </Empty>
              ) : (
                filtered.map((p) => {
                  const isSelected = selectedItems.has(p.id);
                  const qty = selectedItems.get(p.id) || 0;
                  return (
                    <article
                      key={p.id}
                      onClick={() => !isSelected && toggleSelect(p)}
                      className={`group relative overflow-hidden rounded-2xl border shadow-sm transition-all ${
                        isSelected
                          ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200"
                          : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isSelected ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                      <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="shrink-0 w-12 h-12 rounded-xl object-cover bg-gray-50 ring-1 ring-white"
                          />
                        ) : (
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl ring-1 ring-white">
                            🌱
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {p.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                            {p.size && <span>📏 {p.size}</span>}
                            <span>ຕົ້ນທຶນ ₭ {formatMoney(p.costPrice)}</span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => changeQty(p.id, -1)}
                              className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                            >
                              <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={qty}
                              onChange={(e) =>
                                setQty(p.id, parseInt(e.target.value) || 1)
                              }
                              className="w-14 px-2 py-1.5 text-sm text-center border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white"
                            />
                            <button
                              onClick={() => changeQty(p.id, 1)}
                              className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center"
                            >
                              <FaPlus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => removeItem(p.id)}
                              className="w-8 h-8 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 flex items-center justify-center ml-1"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition">
                            + ເລືອກ
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT — cart (desktop) */}
          <aside className="hidden lg:block sticky top-4 self-start">
            <CartPanel
              selectedItems={selectedItems}
              products={products}
              totalPrice={totalPrice}
              totalQty={totalQty}
              supplier={selectedSupplier}
              onClear={() => {
                setSelectedItems(new Map());
                setSelectedSupplierId("");
              }}
              onSubmit={handlePurchaseClick}
              onRemove={removeItem}
              onChangeQty={changeQty}
            />
          </aside>
        </div>
      </div>

      {/* Mobile bottom bar */}
      {selectedItems.size > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/0">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                📋
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-[10px] font-bold flex items-center justify-center">
                  {selectedItems.size}
                </span>
              </span>
              <span className="text-sm font-semibold">ກວດສອບໃບສັ່ງຊື້</span>
            </span>
            <span className="text-base font-bold">
              ₭ {formatMoney(totalPrice)}
            </span>
          </button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileCartOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="w-12 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <CartPanel
                selectedItems={selectedItems}
                products={products}
                totalPrice={totalPrice}
                totalQty={totalQty}
                supplier={selectedSupplier}
                onClear={() => {
                  setSelectedItems(new Map());
                  setSelectedSupplierId("");
                  setMobileCartOpen(false);
                }}
                onSubmit={() => {
                  setMobileCartOpen(false);
                  handlePurchaseClick();
                }}
                onRemove={removeItem}
                onChangeQty={changeQty}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-t-2xl">
              <p className="text-xs opacity-80">ຢືນຢັນການສັ່ງຊື້</p>
              <p className="text-lg font-bold">
                {selectedSupplier?.name || "—"}
              </p>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {Array.from(selectedItems.entries()).map(([productId, qty]) => {
                const p = products.find((x) => x.id === productId);
                if (!p) return null;
                return (
                  <div
                    key={productId}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                      🌱
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        x{qty} @ ₭ {formatMoney(p.costPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700">
                      ₭ {formatMoney(p.costPrice * qty)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  ລວມທັງໝົດ ({selectedItems.size} ລາຍການ)
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  ₭ {formatMoney(totalPrice)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
                >
                  {submitting ? "ກຳລັງບັນທຶກ…" : "ຢືນຢັນ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────

function CartPanel({
  selectedItems,
  products,
  totalPrice,
  totalQty,
  supplier,
  onClear,
  onSubmit,
  onRemove,
  onChangeQty,
}: {
  selectedItems: Map<string, number>;
  products: Product[];
  totalPrice: number;
  totalQty: number;
  supplier?: { id: string; name: string };
  onClear: () => void;
  onSubmit: () => void;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
        <p className="text-xs opacity-80">ໃບສັ່ງຊື້ໃໝ່</p>
        <p className="text-base font-bold mt-0.5">
          {supplier ? `🏭 ${supplier.name}` : "ຍັງບໍ່ໄດ້ເລືອກຜູ້ສະໜອງ"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {selectedItems.size === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="text-5xl mb-2">📋</div>
            <p className="text-sm">ຍັງບໍ່ມີລາຍການ</p>
            <p className="text-xs mt-1">ກົດເລືອກສິນຄ້າ</p>
          </div>
        ) : (
          Array.from(selectedItems.entries()).map(([id, qty]) => {
            const p = products.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 p-2 rounded-xl border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-lg shrink-0">
                  🌱
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    ₭ {formatMoney(p.costPrice)} × {qty}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onChangeQty(id, -1)}
                    className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => onChangeQty(id, 1)}
                    className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemove(id)}
                    className="ml-1 w-6 h-6 rounded-md text-rose-500 hover:bg-rose-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200 p-3 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">ລາຍການ</span>
          <span className="font-semibold">{selectedItems.size}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">ຫົວໜ່ວຍ</span>
          <span className="font-semibold">{totalQty}</span>
        </div>
        <div className="flex justify-between items-end pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">ລວມຍອດ</span>
          <span className="text-2xl font-bold text-emerald-700">
            ₭ {formatMoney(totalPrice)}
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {selectedItems.size > 0 && (
            <button
              onClick={onClear}
              className="px-3 py-3 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
            >
              ✕
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={selectedItems.size === 0}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40 text-sm shadow-sm"
          >
            ສ້າງໃບສັ່ງຊື້
          </button>
        </div>
      </div>
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
          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
          active ? "bg-white/20" : "bg-gray-100 text-gray-600"
        }`}
      >
        {count}
      </span>
    </button>
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
