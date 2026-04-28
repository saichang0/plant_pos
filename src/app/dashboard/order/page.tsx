"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  AsyncIcon,
  CheckIcon,
  CloseIcon,
  ListIcon,
  SearchIcon,
} from "@/src/components/icons/page";
import OrderDetailsPanel from "@/src/components/plantDetail";
import React from "react";
import {
  useSales,
  useUpdateSaleStatus,
  type SaleRecord,
} from "@/src/features/sale/useSale";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon?: React.ReactNode }
> = {
  pending: {
    label: "ກຳລັງລໍຖ້າ",
    color: "bg-orange-400",
    icon: <ListIcon className="text-gray-400" size={32} />,
  },
  confirmed: {
    label: "ອະນຸມັດ",
    color: "bg-emerald-500",
    icon: <AsyncIcon className="text-gray-400" size={32} />,
  },
  paid: { label: "ຈ່າຍແລ້ວ", color: "bg-emerald-500" },
  completed: {
    label: "ສຳເລັດ",
    color: "bg-teal-700",
    icon: <CheckIcon className="text-gray-400" size={32} />,
  },
  cancelled: {
    label: "ຍົກເລີກ",
    color: "bg-red-500",
    icon: <CloseIcon className="text-gray-400" size={32} />,
  },
};

const SUMMARY_KEYS = ["pending", "confirmed", "completed", "cancelled"] as const;

const statusLabel = (s: string) => STATUS_META[s.toLowerCase()]?.label || s;
const statusColor = (s: string) =>
  STATUS_META[s.toLowerCase()]?.color || "bg-gray-400";

function formatDate(value: string | number | Date | undefined) {
  if (!value) return "";
  const d = new Date(
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value
  );
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    Number(n) || 0
  );

function customerDisplayName(order: SaleRecord) {
  if (order.customer) {
    const full =
      `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim();
    return full || "Customer";
  }
  return order.customerName || "Guest";
}

const OrderDashboard = () => {
  const { sales, loading, error, refetch } = useSales();
  const { updating, updateStatus } = useUpdateSaleStatus();

  const [selectedOrder, setSelectedOrder] = React.useState<SaleRecord | null>(
    null
  );
  const [toast, setToast] = React.useState<string | null>(null);
  // null = ທັງໝົດ (all)
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    null
  );
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const statusRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  };

  const changeStatus = async (
    order: SaleRecord,
    next: "confirmed" | "cancelled"
  ) => {
    const result = await updateStatus(order.id, next);
    showToast(
      result.success
        ? `Order ${customerDisplayName(order)} ${next}`
        : `Failed: ${result.message}`
    );
    if (result.success) {
      setSelectedOrder(null);
      refetch({ status: selectedStatus ?? undefined });
    }
  };

  const counts = React.useMemo(() => {
    const acc: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const s of sales) {
      const k = s.status.toLowerCase();
      if (k === "paid") acc.confirmed++;
      else if (k in acc) acc[k]++;
    }
    return acc;
  }, [sales]);

  const statusOptions = React.useMemo(
    () => Array.from(new Set(sales.map((s) => s.status.toLowerCase()))),
    [sales]
  );

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const orderDay = (v: SaleRecord["saleDate"]) => {
      if (!v) return "";
      const d = new Date(
        typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v
      );
      return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    };
    return sales.filter((s) => {
      if (selectedStatus && s.status.toLowerCase() !== selectedStatus) {
        return false;
      }
      if (dateFrom || dateTo) {
        const day = orderDay(s.saleDate);
        if (!day) return false;
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
      }
      if (!q) return true;
      return (
        customerDisplayName(s).toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    });
  }, [sales, selectedStatus, searchQuery, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ການຈັດການຄໍາສັ່ງ</h1>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUMMARY_KEYS.map((key) => {
            const meta = STATUS_META[key];
            const active = selectedStatus === key;
            return (
              <article
                key={key}
                onClick={() => setSelectedStatus(active ? null : key)}
                className={`relative bg-white border rounded-3xl p-2 flex flex-col items-center text-center hover:shadow-2xl shadow-sm transition-all cursor-pointer ${
                  active ? "border-emerald-500" : "border-gray-100"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {meta.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {counts[key]}
                  </p>
                </div>
                <div className="p-2">{meta.icon}</div>
              </article>
            );
          })}
        </section>

        {/* Filters */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex-1 relative max-w-sm">
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ຄົ້ນຫາ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-gray-500">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 px-2"
                  title="Clear"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setShowStatusDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">
                  {selectedStatus ? statusLabel(selectedStatus) : "ທັງໝົດ"}
                </span>
                {showStatusDropdown ? (
                  <ArrowUpIcon size={16} className="text-gray-500" />
                ) : (
                  <ArrowDownIcon size={16} className="text-gray-500" />
                )}
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {[null, ...statusOptions].map((s) => {
                    const active = selectedStatus === s;
                    return (
                      <button
                        key={s ?? "all"}
                        onClick={() => {
                          setSelectedStatus(s);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 ${
                          active
                            ? "text-green-700 font-medium bg-green-50"
                            : "text-gray-700"
                        }`}
                      >
                        {s ? statusLabel(s) : "ທັງໝົດ"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-emerald-900 border-b border-gray-200">
                <tr className="text-gray-400 text-sm">
                  <th className="px-6 py-4 font-medium">ລະຫັດ</th>
                  <th className="px-6 py-4 font-medium">ຊື່ລູກຄ້າ</th>
                  <th className="px-6 py-4 font-medium">ວັນທີ</th>
                  <th className="px-6 py-4 font-medium">ສະຖານະ</th>
                  <th className="px-6 py-4 font-medium">ຈຳນວນ</th>
                  <th className="px-6 py-4 font-medium">ຈຳນວນເງິນ</th>
                  <th className="px-6 py-4 font-medium">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      ກຳລັງໂຫຼດຄຳສັ່ງຊື້…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      ຍັງບໍ່ມີຄຳສັ່ງຊື້ເທື່ອ.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const itemsCount = order.saleDetails.reduce(
                      (sum, d) => sum + Number(d.quantity || 0),
                      0
                    );
                    return (
                      <tr
                        key={order.id}
                        className="text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-5 font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-5 font-medium">
                          {customerDisplayName(order)}
                        </td>
                        <td className="px-6 py-5 text-gray-500">
                          {formatDate(order.saleDate)}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`${statusColor(order.status)} text-white px-4 py-1 rounded-lg text-xs font-semibold`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5">{itemsCount}</td>
                        <td className="px-6 py-5 font-semibold text-gray-900">
                          {formatMoney(order.totalAmount)}
                        </td>
                        <td className="px-6 py-5">
                          <button
                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950"
                            onClick={() => setSelectedOrder(order)}
                          >
                            ກວດສອບ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedOrder && (
          <OrderDetailsPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onConfirm={(o) => changeStatus(o, "confirmed")}
            onCancel={(o) => changeStatus(o, "cancelled")}
            busy={updating}
          />
        )}

        {toast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg">
              {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
