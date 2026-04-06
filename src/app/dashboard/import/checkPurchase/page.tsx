"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@/src/components/icons/page';
import { usePurchaseOrders, useConfirmPurchaseOrder, PurchaseOrder } from '@/src/features/import/useImport';
import PurchaseConfirmPanel from '@/src/components/PurchaseConfirmPanel';
import type { ConfirmItemData } from '@/src/components/PurchaseConfirmPanel';
import { useToast } from '@/src/components/toast';

export default function CheckPurchasePage() {
  const { purchaseOrders, loading, error, refetch } = usePurchaseOrders();
  const { submitting, confirmPurchaseOrder } = useConfirmPurchaseOrder();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ຜູ້ສະໜອງທັງໝົດ');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) setShowSupplierDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only show pending purchase orders
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending');

  // Get unique suppliers from pending orders
  const suppliers = Array.from(new Set(
    pendingOrders.map(po => po.supplier?.name).filter(Boolean)
  )) as string[];

  // Filter
  const filtered = pendingOrders.filter(po => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const supplierName = po.supplier?.name?.toLowerCase() || '';
      const userName = po.user ? `${po.user.firstName} ${po.user.lastName}`.toLowerCase() : '';
      const id = po.id.toLowerCase();
      if (!supplierName.includes(q) && !userName.includes(q) && !id.includes(q)) {
        return false;
      }
    }
    if (selectedSupplier !== 'ຜູ້ສະໜອງທັງໝົດ') {
      if (po.supplier?.name !== selectedSupplier) return false;
    }
    return true;
  });

  const handleConfirm = async (items: ConfirmItemData[]) => {
    if (!selectedPO) return;

    const confirmItems = items.map((item) => ({
      productId: item.productId,
      quantityReceived: item.quantityReceived,
      actualCostPrice: item.costPrice,
      status: item.status as 'received' | 'rejected',
    }));

    const result = await confirmPurchaseOrder(selectedPO.id, confirmItems);

    if (result.success) {
      showToast("ຢືນຢັນການຮັບສິນຄ້າສຳເລັດແລ້ວ", "success");
      setSelectedPO(null);
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ກວດສອບໃບສັ່ງຊື້</h1>
        <p className="text-gray-500 mt-1">ກວດສອບ ແລະ ຢືນຢັນການຮັບສິນຄ້າ</p>
      </header>

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
              <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setSelectedSupplier('ຜູ້ສະໜອງທັງໝົດ'); setShowSupplierDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 rounded-t-lg ${selectedSupplier === 'ຜູ້ສະໜອງທັງໝົດ' ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                >
                  ຜູ້ສະໜອງທັງໝົດ
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
            <div className="text-gray-500">ບໍ່ມີໃບສັ່ງຊື້ທີ່ຕ້ອງກວດສອບ</div>
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
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ຈັດການ</th>
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPO(po)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors"
                      >
                        ກວດສອບ
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

      {/* Confirm Panel */}
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
