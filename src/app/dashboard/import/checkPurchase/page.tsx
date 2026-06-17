"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@/src/components/icons/page";
import {
  usePurchaseOrders,
  useConfirmPurchaseOrder,
  PurchaseOrder,
} from "@/src/features/import/useImport";
import PurchaseConfirmPanel from "@/src/components/PurchaseConfirmPanel";
import type { ConfirmItemData } from "@/src/components/PurchaseConfirmPanel";
import { useToast } from "@/src/components/toast";

const formatMoney = (n: number | string | undefined) =>
  Number(n || 0).toLocaleString("en-US");

export default function CheckPurchasePage() {
  const router = useRouter();
  const { purchaseOrders, loading, error, refetch } = usePurchaseOrders();
  const { submitting, confirmPurchaseOrder } = useConfirmPurchaseOrder();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        supplierRef.current &&
        !supplierRef.current.contains(e.target as Node)
      )
        setShowSupplierDropdown(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pendingOrders = purchaseOrders.filter((po) => po.status === "pending");

  const suppliers = Array.from(
    new Set(pendingOrders.map((po) => po.supplier?.name).filter(Boolean)),
  ) as string[];

  const filtered = pendingOrders.filter((po) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const s = po.supplier?.name?.toLowerCase() || "";
      const u = po.user
        ? `${po.user.firstName} ${po.user.lastName}`.toLowerCase()
        : "";
      if (!s.includes(q) && !u.includes(q) && !po.id.toLowerCase().includes(q))
        return false;
    }
    if (selectedSupplier !== "all" && po.supplier?.name !== selectedSupplier)
      return false;
    return true;
  });

  const handleConfirm = async (items: ConfirmItemData[]) => {
    if (!selectedPO) return;
    const confirmItems = items.map((item) => ({
      productId: item.productId,
      quantityReceived: item.quantityReceived,
      actualCostPrice: item.costPrice,
      status: item.status as "received" | "rejected",
    }));
    const r = await confirmPurchaseOrder(selectedPO.id, confirmItems);
    if (r.success) {
      showToast("ຢືນຢັນການຮັບສິນຄ້າສຳເລັດແລ້ວ", "success");
      setSelectedPO(null);
      refetch();
    } else {
      showToast(r.message, "error");
    }
  };

  const totalValue = pendingOrders.reduce(
    (s, po) => s + Number(po.totalPrice),
    0,
  );
  const totalItems = pendingOrders.reduce(
    (s, po) => s + po.purchaseOrderDetails.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
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
              ກວດສອບໃບສັ່ງຊື້
            </h1>
            <p className="text-xs text-gray-500">
              ກວດສອບ ແລະ ຢືນຢັນການຮັບສິນຄ້າຈາກຜູ້ສະໜອງ
            </p>
          </div>
        </header>

        {/* KPI tiles */}
        <section className="grid grid-cols-3 gap-4">
          <KpiCard
            title="ລໍຖ້າກວດສອບ"
            value={String(pendingOrders.length)}
            sub="ໃບສັ່ງຊື້"
            color="orange"
            icon="⏳"
          />
          <KpiCard
            title="ສິນຄ້າ"
            value={String(totalItems)}
            sub="ລາຍການລວມ"
            color="blue"
            icon="📦"
          />
          <KpiCard
            title="ມູນຄ່າ"
            value={`₭ ${formatMoney(totalValue)}`}
            sub="ຕົ້ນທຶນລໍຖ້າ"
            color="purple"
            icon="💰"
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ PO, ຜູ້ສະໜອງ..."
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
              <span className="text-gray-700">
                {selectedSupplier === "all"
                  ? "ຜູ້ສະໜອງທັງໝົດ"
                  : selectedSupplier}
              </span>
              {showSupplierDropdown ? (
                <ArrowUpIcon size={16} className="text-gray-500 ml-auto" />
              ) : (
                <ArrowDownIcon size={16} className="text-gray-500 ml-auto" />
              )}
            </button>
            {showSupplierDropdown && (
              <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedSupplier("all");
                    setShowSupplierDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 ${
                    selectedSupplier === "all"
                      ? "text-emerald-700 font-medium bg-emerald-50"
                      : "text-gray-700"
                  }`}
                >
                  ຜູ້ສະໜອງທັງໝົດ
                </button>
                {suppliers.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSupplier(s);
                      setShowSupplierDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 ${
                      selectedSupplier === s
                        ? "text-emerald-700 font-medium bg-emerald-50"
                        : "text-gray-700"
                    }`}
                  >
                    🏭 {s}
                  </button>
                ))}
              </div>
            )}
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
          ) : filtered.length === 0 ? (
            <Empty>
              <div className="text-6xl">✓</div>
              <div className="text-sm text-gray-400">
                ບໍ່ມີໃບສັ່ງຊື້ທີ່ຕ້ອງກວດສອບ
              </div>
            </Empty>
          ) : (
            filtered.map((po) => (
              <article
                key={po.id}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
                <div className="pl-5 pr-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        PO-{po.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {po.supplier?.name || "—"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>
                        📅{" "}
                        {new Date(Number(po.orderDate)).toLocaleDateString(
                          "en-US",
                        )}
                      </span>
                      <span>📦 {po.purchaseOrderDetails.length} ລາຍການ</span>
                      {po.user && (
                        <span>
                          🧑‍💼 {po.user.firstName} {po.user.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      ມູນຄ່າ
                    </p>
                    <p className="text-base font-bold text-emerald-700">
                      ₭ {formatMoney(po.totalPrice)}
                    </p>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    ລໍຖ້າ
                  </span>

                  <button
                    onClick={() => setSelectedPO(po)}
                    className="shrink-0 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 shadow-sm"
                  >
                    ກວດສອບ
                  </button>
                </div>
              </article>
            ))
          )}
          {filtered.length > 0 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              ສະແດງ {filtered.length} ໃບສັ່ງຊື້
            </p>
          )}
        </section>
      </div>

      {selectedPO && (
        <PurchaseConfirmPanel
          purchaseOrder={selectedPO}
          onClose={() => setSelectedPO(null)}
          onConfirm={handleConfirm}
          submitting={submitting}
        />
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
  color: "emerald" | "blue" | "purple" | "orange" | "rose" | "slate";
  icon: string;
}) {
  const palette = {
    emerald: { bg: "from-emerald-50 to-emerald-100", blob: "bg-emerald-300", label: "text-emerald-800", value: "text-emerald-900", sub: "text-emerald-700/80" },
    blue: { bg: "from-blue-50 to-blue-100", blob: "bg-blue-300", label: "text-blue-800", value: "text-blue-900", sub: "text-blue-700/80" },
    purple: { bg: "from-purple-50 to-purple-100", blob: "bg-purple-300", label: "text-purple-800", value: "text-purple-900", sub: "text-purple-700/80" },
    orange: { bg: "from-orange-50 to-amber-100", blob: "bg-orange-300", label: "text-orange-800", value: "text-orange-900", sub: "text-orange-700/80" },
    rose: { bg: "from-rose-50 to-rose-100", blob: "bg-rose-300", label: "text-rose-800", value: "text-rose-900", sub: "text-rose-700/80" },
    slate: { bg: "from-slate-50 to-slate-100", blob: "bg-slate-300", label: "text-slate-700", value: "text-slate-900", sub: "text-slate-500" },
  }[color];
  return (
    <article className={`relative overflow-hidden rounded-3xl p-5 shadow-sm bg-gradient-to-br ${palette.bg}`}>
      <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 ${palette.blob}`} />
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
