"use client";
import React, { useState, useMemo } from 'react';
import {
  SearchIcon,
  WarningIcon,
  EditIcon,
  TrashIcon,
} from '@/src/components/icons/page';
import { useImports } from '@/src/features/import/useImport';
import { useToast } from '@/src/components/toast';
import { gqlFetch } from '@/src/lib/gqlFetch';
import { UPDATE_STOCK_DETAIL_MUTATION, DELETE_STOCK_DETAIL_MUTATION } from '@/src/apollo/import/mutation';
import { UPDATE_PRODUCT_MUTATION } from '@/src/apollo/product/mutation';

const LOW_STOCK_THRESHOLD = 5;

export default function InventoryPage() {
  const { imports, loading, error, refetch } = useImports();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editQty, setEditQty] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number>(0);
  const [editProductId, setEditProductId] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Flatten all received reception details
  const inventoryItems = useMemo(() => {
    return imports.flatMap((imp) =>
      imp.stockReceptionDetails
        .filter((d) => d.status === 'received')
        .map((detail) => ({
          detailId: detail.id,
          productId: detail.productId,
          name: detail.product?.name || '-',
          imageUrl: detail.product?.imageUrl || '',
          salePrice: detail.product?.salePrice || 0,
          costPrice: Number(detail.actualCostPrice),
          quantity: detail.quantityReceived,
        }))
    );
  }, [imports]);

  // Filter
  const filtered = useMemo(() => {
    let items = inventoryItems;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort: low stock first
    return items.sort((a, b) => a.quantity - b.quantity);
  }, [inventoryItems, searchQuery]);

  // Stats
  const totalProducts = inventoryItems.length;
  const totalQty = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = inventoryItems.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD).length;
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);

  const statsCards = [
    { label: 'ສິນຄ້າທັງໝົດ', value: totalProducts.toLocaleString() },
    { label: 'ຈຳນວນລວມ', value: totalQty.toLocaleString() },
    { label: 'ໃກ້ໝົດ', value: lowStockCount.toLocaleString(), warn: lowStockCount > 0 },
    { label: 'ມູນຄ່າລວມ', value: `₭ ${totalValue.toLocaleString()}` },
  ];

  const formatPrice = (price: number) => price.toLocaleString('en-US');

  const handleEditStart = (detailId: string, productId: string, currentQty: number, currentSalePrice: number) => {
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
      const result = await gqlFetch(DELETE_STOCK_DETAIL_MUTATION, { input: { id: deleteConfirm.id } });
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
      // Update quantityReceived on stockReceptionDetail
      const qtyResult = await gqlFetch(UPDATE_STOCK_DETAIL_MUTATION, {
            input: {
              id: detailId,
              data: { quantityReceived: editQty },
            },
          });
      if (qtyResult.errors) {
        showToast(qtyResult.errors[0].message, "error");
        return;
      }

      // Update salePrice on product
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ສາງສິນຄ້າ</h1>
            <p className="text-gray-500 mt-1">ລາຍການສິນຄ້າໃນສາງ</p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, index) => (
          <div key={index} className={`bg-white rounded-2xl p-5 shadow-sm border ${card.warn ? 'border-red-300' : 'border-gray-200'}`}>
            <p className="text-xs uppercase tracking-wide mb-2 text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold ${card.warn ? 'text-red-600' : 'text-gray-900'}`}>{card.value}</p>
          </div>
        ))}
      </section>

      {/* Search */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຮູບ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຊື່ສິນຄ້າ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຕົ້ນທຶນ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຂາຍ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ຈຳນວນ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item, index) => {
                  const isLowStock = item.quantity <= LOW_STOCK_THRESHOLD;
                  const isEditing = editingId === item.detailId;

                  return (
                    <tr
                      key={item.detailId}
                      className={`transition-colors ${isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {isLowStock && <WarningIcon size={16} className="text-red-500" />}
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        {isLowStock && (
                          <p className="text-xs text-red-600 font-medium mt-0.5">ໃກ້ໝົດສະຕ໋ອກ</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">
                        ₭ {formatPrice(item.costPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        ₭ {formatPrice(item.salePrice)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-lg ${
                            isLowStock
                              ? 'text-red-700 bg-red-100'
                              : 'text-green-700 bg-green-100'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditStart(item.detailId, item.productId, item.quantity, item.salePrice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.detailId, item.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">ທັງໝົດ {filtered.length} ສິນຄ້າ</p>
        </div>
      </section>

      {/* Edit Modal */}
      {showEditModal && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-4">ແກ້ໄຂຂໍ້ມູນ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ຈຳນວນ</label>
                <input
                  type="number"
                  min={0}
                  value={editQty || ''}
                  onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ລາຄາຂາຍ</label>
                <input
                  type="number"
                  min={0}
                  value={editSalePrice || ''}
                  onChange={(e) => setEditSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setEditingId(null); }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={() => handleEditSave(editingId)}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors disabled:opacity-50"
              >
                {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <WarningIcon size={28} className="text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ຢືນຢັນການລົບ</h3>
            <p className="text-sm text-gray-500 mb-6">
              ທ່ານຕ້ອງການລົບ &quot;{deleteConfirm.name}&quot; ບໍ?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'ກຳລັງລົບ...' : 'ລົບ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
