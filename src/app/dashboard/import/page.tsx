"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon, SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  BackIcon,
  DotThreeIcon,
} from '@/src/components/icons/page';
import { usePurchaseOrders, type PurchaseOrder } from '@/src/features/import/useImport';
import { MdCheck } from 'react-icons/md';
import { FaRegEye } from 'react-icons/fa';

const statusStyles: Record<string, string> = {
  pending: 'text-orange-500 font-semibold',
  received: 'text-green-600 font-semibold',
  cancelled: 'text-red-500 font-semibold',
};

const statusLabels: Record<string, string> = {
  pending: 'PENDING',
  received: 'RECEIVED',
  cancelled: 'CANCELLED',
};

export default function ImportPage() {
  const router = useRouter();
  const { purchaseOrders, loading, error, refetch } = usePurchaseOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusOptions = ['All Status', 'pending', 'received', 'cancelled'];

  // Detail panel
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) setShowSupplierDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique suppliers from data
  const suppliers = Array.from(new Set(
    purchaseOrders.map(po => po.supplier?.name).filter(Boolean)
  )) as string[];

  // Compute stats from real data
  const totalOrders = purchaseOrders.length;
  const totalItems = purchaseOrders.reduce((sum, po) =>
    sum + po.purchaseOrderDetails.reduce((s, d) => s + d.quantity, 0), 0
  );
  const totalValue = purchaseOrders.reduce((sum, po) => sum + Number(po.totalPrice), 0);
  const pendingCount = purchaseOrders.filter(po => po.status === 'pending').length;

  const statsCards = [
    { label: 'ໃບສັ່ງຊື້ທັງໝົດ', value: totalOrders.toLocaleString() },
    { label: 'ຈຳນວນສິນຄ້າ', value: totalItems.toLocaleString() },
    { label: 'ມູນຄ່າລວມ', value: `₭ ${totalValue.toLocaleString()}` },
    { label: 'ລໍຖ້າ', value: pendingCount.toLocaleString() },
  ];

  // Filter purchase orders
  const filtered = purchaseOrders.filter(po => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const supplierName = po.supplier?.name?.toLowerCase() || '';
      const userName = po.user ? `${po.user.firstName} ${po.user.lastName}`.toLowerCase() : '';
      const id = po.id.toLowerCase();
      if (!supplierName.includes(q) && !userName.includes(q) && !id.includes(q)) {
        return false;
      }
    }
    if (selectedSupplier !== 'All Suppliers') {
      if (po.supplier?.name !== selectedSupplier) return false;
    }
    if (selectedStatus !== 'All Status') {
      if (po.status !== selectedStatus) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CalendarIcon />
            </button>
            <button
              onClick={() => router.push('/dashboard/import/purchase')}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-800 text-white rounded-lg hover:bg-emerald-950 transition-colors">
              <PlusIcon size={18} />
              <span className="text-sm font-medium">ສ້າງໃບສັ່ງຊື້</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/import/checkPurchase')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-lg hover:bg-emerald-950 transition-colors">
              <MdCheck size={18} />
              <span className="text-sm font-medium">ກວດສອບ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p className="text-xs uppercase tracking-wide mb-2 text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ PO, ຜູ້ສະໜອງ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Supplier Dropdown */}
          <div className="relative" ref={supplierRef}>
            <button
              onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedSupplier}</span>
              {showSupplierDropdown ? <ArrowUpIcon size={16} className="text-gray-500" /> : <ArrowDownIcon size={16} className="text-gray-500" />}
            </button>
            {showSupplierDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setSelectedSupplier('All Suppliers'); setShowSupplierDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 rounded-t-lg ${selectedSupplier === 'All Suppliers' ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                >
                  All Suppliers
                </button>
                {suppliers.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSupplier(s); setShowSupplierDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 last:rounded-b-lg ${selectedSupplier === s ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedStatus}</span>
              {showStatusDropdown ? <ArrowUpIcon size={16} className="text-gray-500" /> : <ArrowDownIcon size={16} className="text-gray-500" />}
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedStatus(s); setShowStatusDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${selectedStatus === s ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                  >
                    {s === 'All Status' ? s : statusLabels[s] || s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-emerald-900 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">PO ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຜູ້ສະໜອງ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ວັນທີສັ່ງ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາລວມ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຍການ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຜູ້ສັ່ງ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ສະຖານະ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((po, index) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{po.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{po.supplier?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(Number(po.orderDate)).toLocaleDateString('lo-LA')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ₭ {Number(po.totalPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {po.purchaseOrderDetails.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {po.user ? `${po.user.firstName} ${po.user.lastName}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={statusStyles[po.status] || 'text-gray-900'}>
                        {statusLabels[po.status] || po.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedOrder(po)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="ເບິ່ງລາຍລະອຽດ"
                      >
                        <FaRegEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">ທັງໝົດ {filtered.length} ລາຍການ</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* Purchase Order Detail Panel (slide-in) */}
      {/* ═══════════════════════════════════════════════ */}
      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSelectedOrder(null)} />
          <aside className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl overflow-y-auto z-40">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close"
                  >
                    <BackIcon size={24} />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      PO #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        selectedOrder.status === 'received' ? 'bg-green-100 text-green-700' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {statusLabels[selectedOrder.status] || selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(Number(selectedOrder.orderDate)).toLocaleString('lo-LA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => router.push(`/dashboard/import/checkPurchase?id=${selectedOrder.id}`)}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                    >
                      ກວດສອບ
                    </button>
                  )}
                  <button className="p-2 text-gray-600 hover:text-gray-900">
                    <DotThreeIcon size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              {/* Items */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">ລາຍການສິນຄ້າ</h4>
                  <span className="text-xs text-gray-500">{selectedOrder.purchaseOrderDetails.length} ລາຍການ</span>
                </div>

                <div className="space-y-3">
                  {selectedOrder.purchaseOrderDetails.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-2xl shrink-0">
                          🌱
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || '-'}</h5>
                          <p className="text-xs text-gray-500 mt-1">
                            ຈຳນວນ: {item.quantity}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            ຕົ້ນທຶນ: ₭ {Number(item.product?.costPrice || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            ₭ {(Number(item.product?.costPrice || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order Summary */}
              <section>
                <h4 className="text-base font-semibold text-gray-900 mb-3">ສະຫຼຸບຄຳສັ່ງຊື້</h4>

                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ຈຳນວນລາຍການ</span>
                    <span className="font-medium text-gray-900">{selectedOrder.purchaseOrderDetails.length}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ຈຳນວນສິນຄ້າລວມ</span>
                    <span className="font-medium text-gray-900">
                      {selectedOrder.purchaseOrderDetails.reduce((s, d) => s + d.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-base pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">ລາຄາລວມ</span>
                    <span className="font-bold text-gray-900">₭ {Number(selectedOrder.totalPrice).toLocaleString()}</span>
                  </div>

                  {selectedOrder.stockReceptions && selectedOrder.stockReceptions.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">ການຮັບສິນຄ້າ</p>
                      {selectedOrder.stockReceptions.map((r) => (
                        <div key={r.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(Number(r.receptionDate)).toLocaleDateString('lo-LA')}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₭ {Number(r.totalActualPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Supplier & Staff */}
              <section>
                <h4 className="text-base font-semibold text-gray-900 mb-3">ຂໍ້ມູນຜູ້ສະໜອງ & ພະນັກງານ</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">ຜູ້ສະໜອງ</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <span>🏭</span> {selectedOrder.supplier?.name || '-'}
                    </p>
                    {selectedOrder.supplier?.phoneNumber && (
                      <p className="text-xs text-gray-500 mt-1">📞 {selectedOrder.supplier.phoneNumber}</p>
                    )}
                    {selectedOrder.supplier?.email && (
                      <p className="text-xs text-gray-500 mt-1">✉️ {selectedOrder.supplier.email}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">ຜູ້ສັ່ງ</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <span>🧑‍💼</span>
                      {selectedOrder.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : '-'}
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
