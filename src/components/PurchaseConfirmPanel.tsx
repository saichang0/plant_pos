"use client";
import React, { useState } from 'react';
import { BackIcon } from '@/src/components/icons/page';
import type { PurchaseOrder } from '@/src/features/import/useImport';

type ItemStatus = 'received' | 'rejected';

export interface ConfirmItemData {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  quantityReceived: number;
  status: ItemStatus;
}

type PurchaseConfirmPanelProps = {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onConfirm: (items: ConfirmItemData[]) => void;
  submitting: boolean;
};

const PurchaseConfirmPanel: React.FC<PurchaseConfirmPanelProps> = ({
  purchaseOrder,
  onClose,
  onConfirm,
  submitting,
}) => {
  const [items, setItems] = useState<ConfirmItemData[]>(
    purchaseOrder.purchaseOrderDetails.map((d) => ({
      productId: d.productId,
      productName: d.product?.name || '-',
      quantity: d.quantity,
      costPrice: d.product?.costPrice || 0,
      quantityReceived: d.quantity,
      status: 'received' as ItemStatus,
    }))
  );

  const updateItem = (index: number, updates: Partial<ConfirmItemData>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const totalReceived = items
    .filter((i) => i.status === 'received')
    .reduce((sum, i) => sum + i.costPrice * i.quantityReceived, 0);

  const formatPrice = (price: number) => price.toLocaleString('en-US');

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl overflow-y-auto z-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={onClose}
              >
                <BackIcon size={24} />
              </button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  PO #{purchaseOrder.id.slice(0, 8)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                    {purchaseOrder.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(Number(purchaseOrder.orderDate)).toLocaleDateString('lo-LA')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supplier Info */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">ຜູ້ສະໜອງ</p>
            <p className="text-sm font-semibold text-gray-900">{purchaseOrder.supplier?.name || '-'}</p>
            {purchaseOrder.supplier?.phoneNumber && (
              <p className="text-xs text-gray-500 mt-1">{purchaseOrder.supplier.phoneNumber}</p>
            )}
          </section>

          {/* Items List */}
          <section>
            <h4 className="text-base font-semibold text-gray-900 mb-3">
              ລາຍການສິນຄ້າ ({items.length})
            </h4>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className={`border rounded-xl p-4 transition-colors ${
                    item.status === 'received'
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ສັ່ງ: {item.quantity} | ລາຄາ: ₭ {formatPrice(item.costPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      ₭ {formatPrice(item.costPrice * item.quantityReceived)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity received */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">ຮັບ:</label>
                      <input
                        type="number"
                        min={0}
                        value={item.quantityReceived}
                        onChange={(e) =>
                          updateItem(index, {
                            quantityReceived: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={item.status === 'rejected'}
                        className="w-20 px-2 py-1.5 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>

                    {/* Status toggle */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => updateItem(index, { status: 'received', quantityReceived: item.quantity })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          item.status === 'received'
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        ຮັບແລ້ວ
                      </button>
                      <button
                        onClick={() => updateItem(index, { status: 'rejected', quantityReceived: 0 })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          item.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        ບໍ່ຮັບ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ລາຄາສັ່ງຊື້</span>
              <span className="font-medium text-gray-900">₭ {formatPrice(Number(purchaseOrder.totalPrice))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ຮັບແລ້ວ</span>
              <span className="font-medium text-green-700">
                {items.filter((i) => i.status === 'received').length} / {items.length} ລາຍການ
              </span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="font-semibold text-gray-900">ມູນຄ່າຮັບຕົວຈິງ</span>
              <span className="text-lg font-bold text-emerald-900">₭ {formatPrice(totalReceived)}</span>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              onClick={() => onConfirm(items)}
              disabled={submitting}
              className="flex-1 px-5 py-3 text-sm font-medium text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors disabled:opacity-50"
            >
              {submitting ? 'ກຳລັງບັນທຶກ...' : 'ຢືນຢັນການຮັບ'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PurchaseConfirmPanel;
