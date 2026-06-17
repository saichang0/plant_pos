"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
} from "@/src/components/icons/page";
import {
  usePurchaseOrders,
  type PurchaseOrder,
} from "@/src/features/import/useImport";
import { MdCheck } from "react-icons/md";

const formatMoney = (n: number | string | undefined) =>
  Number(n || 0).toLocaleString("en-US");

const statusMeta: Record<
  string,
  { label: string; bar: string; chip: string; emoji: string }
> = {
  pending: {
    label: "ລໍຖ້າ",
    bar: "bg-orange-500",
    chip: "bg-orange-100 text-orange-700",
    emoji: "⏳",
  },
  received: {
    label: "ຮັບແລ້ວ",
    bar: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-700",
    emoji: "✓",
  },
  cancelled: {
    label: "ຍົກເລີກ",
    bar: "bg-rose-500",
    chip: "bg-rose-100 text-rose-700",
    emoji: "✕",
  },
};

const ALL = "all";

export default function ImportPage() {
  const router = useRouter();
  const { purchaseOrders, loading, error, refetch } = usePurchaseOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>(ALL);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>(ALL);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node))
        setShowSupplierDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node))
        setShowStatusDropdown(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suppliers = Array.from(
    new Set(purchaseOrders.map((po) => po.supplier?.name).filter(Boolean)),
  ) as string[];

  const totalOrders = purchaseOrders.length;
  const totalItems = purchaseOrders.reduce(
    (s, po) => s + po.purchaseOrderDetails.reduce((x, d) => x + d.quantity, 0),
    0,
  );
  const totalValue = purchaseOrders.reduce(
    (s, po) => s + Number(po.totalPrice),
    0,
  );
  const pendingCount = purchaseOrders.filter((po) => po.status === "pending").length;

  const filtered = purchaseOrders.filter((po) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const s = po.supplier?.name?.toLowerCase() || "";
      const u = po.user
        ? `${po.user.firstName} ${po.user.lastName}`.toLowerCase()
        : "";
      if (!s.includes(q) && !u.includes(q) && !po.id.toLowerCase().includes(q))
        return false;
    }
    if (selectedSupplier !== ALL && po.supplier?.name !== selectedSupplier)
      return false;
    if (selectedStatus !== ALL && po.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ໃບສັ່ງຊື້
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ສ້າງ ແລະ ກວດສອບການສັ່ງຊື້ສິນຄ້າຈາກຜູ້ສະໜອງ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/import/checkPurchase")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 transition"
            >
              <MdCheck size={16} />
              ກວດສອບ
            </button>
            <button
              onClick={() => router.push("/dashboard/import/purchase")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition"
            >
              <PlusIcon size={16} />
              ສ້າງໃບສັ່ງຊື້
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="ໃບສັ່ງຊື້ທັງໝົດ"
            value={String(totalOrders)}
            sub="ໃບສັ່ງ"
            color="emerald"
            icon="📋"
          />
          <KpiCard
            title="ຈຳນວນສິນຄ້າ"
            value={String(totalItems)}
            sub="ຫົວໜ່ວຍ"
            color="blue"
            icon="📦"
          />
          <KpiCard
            title="ມູນຄ່າລວມ"
            value={`₭ ${formatMoney(totalValue)}`}
            sub="ຕົ້ນທຶນທັງໝົດ"
            color="purple"
            icon="💰"
          />
          <KpiCard
            title="ລໍຖ້າ"
            value={String(pendingCount)}
            sub="ຍັງບໍ່ໄດ້ກວດສອບ"
            color={pendingCount > 0 ? "orange" : "slate"}
            icon="⏳"
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative w-full lg:w-80">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ຄົ້ນຫາລະຫັດ, ຜູ້ສະໜອງ..."
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
              {/* Supplier dropdown */}
              <div className="relative" ref={supplierRef}>
                <button
                  onClick={() => setShowSupplierDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition"
                >
                  <span className="text-gray-700">
                    {selectedSupplier === ALL ? "ທັງໝົດຜູ້ສະໜອງ" : selectedSupplier}
                  </span>
                  {showSupplierDropdown ? (
                    <ArrowUpIcon size={16} className="text-gray-500" />
                  ) : (
                    <ArrowDownIcon size={16} className="text-gray-500" />
                  )}
                </button>
                {showSupplierDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden max-h-64 overflow-y-auto">
                    <DropItem
                      active={selectedSupplier === ALL}
                      onClick={() => {
                        setSelectedSupplier(ALL);
                        setShowSupplierDropdown(false);
                      }}
                      label="ທັງໝົດຜູ້ສະໜອງ"
                    />
                    {suppliers.map((s) => (
                      <DropItem
                        key={s}
                        active={selectedSupplier === s}
                        onClick={() => {
                          setSelectedSupplier(s);
                          setShowSupplierDropdown(false);
                        }}
                        label={s}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status dropdown */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm transition"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedStatus === ALL
                        ? "bg-gray-400"
                        : statusMeta[selectedStatus]?.bar
                    }`}
                  />
                  <span className="text-gray-700">
                    {selectedStatus === ALL
                      ? "ທຸກສະຖານະ"
                      : statusMeta[selectedStatus]?.label || selectedStatus}
                  </span>
                  {showStatusDropdown ? (
                    <ArrowUpIcon size={16} className="text-gray-500" />
                  ) : (
                    <ArrowDownIcon size={16} className="text-gray-500" />
                  )}
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    {[ALL, "pending", "received", "cancelled"].map((s) => (
                      <DropItem
                        key={s}
                        active={selectedStatus === s}
                        onClick={() => {
                          setSelectedStatus(s);
                          setShowStatusDropdown(false);
                        }}
                        label={
                          s === ALL ? "ທຸກສະຖານະ" : statusMeta[s]?.label || s
                        }
                        dot={s === ALL ? "bg-gray-400" : statusMeta[s]?.bar}
                      />
                    ))}
                  </div>
                )}
              </div>

              {(searchQuery ||
                selectedSupplier !== ALL ||
                selectedStatus !== ALL) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSupplier(ALL);
                    setSelectedStatus(ALL);
                  }}
                  className="px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
                >
                  ລ້າງ
                </button>
              )}
            </div>
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
              <div className="text-6xl">📋</div>
              <div className="text-sm text-gray-400">ບໍ່ມີໃບສັ່ງຊື້</div>
            </Empty>
          ) : (
            filtered.map((po) => {
              const meta = statusMeta[po.status] || statusMeta.pending;
              const itemsCount = po.purchaseOrderDetails.length;
              return (
                <article
                  key={po.id}
                  onClick={() => setSelectedOrder(po)}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${meta.bar}`} />
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
                          📅 {new Date(Number(po.orderDate)).toLocaleDateString("en-US")}
                        </span>
                        <span>📦 {itemsCount} ລາຍການ</span>
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

                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.chip}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.bar}`} />
                      {meta.label}
                    </span>

                    <div
                      className="shrink-0 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {po.status === "pending" && (
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/import/checkPurchase?id=${po.id}`,
                            )
                          }
                          className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 shadow-sm"
                        >
                          ກວດສອບ
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(po)}
                        className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100"
                      >
                        ລາຍລະອຽດ
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
          {filtered.length > 0 && (
            <p className="text-xs text-gray-500 text-center pt-2">
              ສະແດງ {filtered.length} ໃບສັ່ງຊື້
            </p>
          )}
        </section>
      </div>

      {/* Detail drawer */}
      {selectedOrder && (
        <PurchaseDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCheck={() => {
            router.push(
              `/dashboard/import/checkPurchase?id=${selectedOrder.id}`,
            );
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────

function PurchaseDetailDrawer({
  order,
  onClose,
  onCheck,
}: {
  order: PurchaseOrder;
  onClose: () => void;
  onCheck: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const meta = statusMeta[order.status] || statusMeta.pending;
  const itemsCount = order.purchaseOrderDetails.length;
  const totalQty = order.purchaseOrderDetails.reduce(
    (s, d) => s + d.quantity,
    0,
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col">
        <div
          className={`px-6 py-5 text-white bg-gradient-to-r ${
            order.status === "received"
              ? "from-emerald-700 to-emerald-800"
              : order.status === "cancelled"
                ? "from-rose-700 to-rose-800"
                : "from-orange-600 to-orange-700"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                ໃບສັ່ງຊື້
              </div>
              <div className="mt-1 text-2xl font-bold font-mono">
                PO-{order.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${meta.chip}`}
                >
                  {meta.label}
                </span>
                <span className="text-xs opacity-80">
                  {new Date(Number(order.orderDate)).toLocaleString("en-US")}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
          {/* Supplier */}
          <Section title="ຜູ້ສະໜອງ">
            <div className="font-semibold text-gray-900">
              🏭 {order.supplier?.name || "—"}
            </div>
            {order.supplier?.phoneNumber && (
              <div className="text-gray-600 text-sm">
                📞 {order.supplier.phoneNumber}
              </div>
            )}
            {order.supplier?.email && (
              <div className="text-gray-600 text-sm">
                ✉ {order.supplier.email}
              </div>
            )}
            {order.user && (
              <div className="mt-2 text-xs text-gray-500">
                ສັ່ງໂດຍ: {order.user.firstName} {order.user.lastName}
              </div>
            )}
          </Section>

          {/* Items */}
          <Section title={`ລາຍການສິນຄ້າ (${itemsCount})`}>
            <div className="space-y-2">
              {order.purchaseOrderDetails.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl ring-1 ring-white">
                    🌱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product?.name || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ຈຳນວນ: {item.quantity} · ຕົ້ນທຶນ ₭{" "}
                      {formatMoney(item.product?.costPrice)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-bold text-emerald-700">
                    ₭{" "}
                    {formatMoney(
                      Number(item.product?.costPrice || 0) * item.quantity,
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Summary */}
          <Section title="ສະຫຼຸບ">
            <div className="space-y-2">
              <Row label="ຈຳນວນລາຍການ" value={String(itemsCount)} />
              <Row label="ຈຳນວນສິນຄ້າລວມ" value={String(totalQty)} />
              <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  ລາຄາລວມ
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  ₭ {formatMoney(order.totalPrice)}
                </span>
              </div>
            </div>
          </Section>

          {/* Reception history */}
          {order.stockReceptions && order.stockReceptions.length > 0 && (
            <Section title="ການຮັບສິນຄ້າ">
              <div className="space-y-2">
                {order.stockReceptions.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between text-sm px-3 py-2 rounded-lg bg-emerald-50/40"
                  >
                    <span className="text-gray-700">
                      📅 {new Date(Number(r.receptionDate)).toLocaleDateString("en-US")}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      ₭ {formatMoney(r.totalActualPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            ປິດ
          </button>
          {order.status === "pending" && (
            <button
              onClick={onCheck}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-sm"
            >
              ກວດສອບ
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function DropItem({
  active,
  onClick,
  label,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
        active ? "text-emerald-700 font-medium bg-emerald-50" : "text-gray-700"
      }`}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h3>
      <div className="rounded-xl border border-gray-200 p-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
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
