"use client";
import React, { useState } from 'react';
import {
  CalendarIcon, SearchIcon,
  ArrowDownIcon,
  PlusIcon
} from '@/src/components/icons/page';
import OrderDetailsPanel from '@/src/components/OrderDetailsPanel';

type OrderData = {
  id: string;
  customer: string;
  date: string;
  status: string;
  items: string;
  total: string;
  statusColor: string;
};

const deliveries = [
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'COMPLETE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'PARTIAL' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'LATE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'LATE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'COMPLETE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'LATE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'COMPLETE' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'PARTIAL' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'PARTIAL' },
  { niin: '703231989', pr: 'PR-2024-0989', po: 'PO-376780', contract: 'FA8852-74-C-6339', vendor: 'Lockheed Martin', branch: 'Army Logistics Command', status: 'COMPLETE' },
];

const statusStyles: Record<string, string> = {
  COMPLETE: 'text-green-600 font-semibold',
  PARTIAL: 'text-orange-500 font-semibold',
  LATE: 'text-red-500 font-semibold',
};

export default function PurchasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Categories');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showPanel, setShowPanel] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const handleMarkDelivery = (order: OrderData) => {
    // Placeholder for marking delivery
    console.log('Mark delivery for order:', order);
  };

  const handleRowClick = (index: number) => {
    // Only handle selection for purchase, no panel opening
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Filters */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by NIIN, PR, PO, or Contract..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* All Vendors Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">{selectedVendor}</span>
              <ArrowDownIcon size={16} className="text-gray-500" />
            </button>
          </div>

          {/* All Branches Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedBranch}</span>
              <ArrowDownIcon size={16} className="text-gray-500" />
            </button>

            {showBranchDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {/* {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setShowBranchDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {branch}
                  </button>
                ))} */}
              </div>
            )}
          </div>

          {/* All Status Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">{selectedStatus}</span>
              <ArrowDownIcon size={16} className="text-gray-500" />
            </button>
          </div>

          {/* purchase */}
          <button
          onClick={() => {
            if (selectedRows.size > 0) {
              const firstSelectedIndex = Array.from(selectedRows)[0];
              const delivery = deliveries[firstSelectedIndex];
              const order: OrderData = {
                id: delivery.po,
                customer: delivery.vendor,
                date: '12 August, 2024', // placeholder
                status: delivery.status,
                items: `${selectedRows.size} item${selectedRows.size > 1 ? 's' : ''}`, // show count
                total: `$${(selectedRows.size * 402.87).toFixed(2)}`, // placeholder calculation
                statusColor: statusStyles[delivery.status] || 'text-gray-900',
              };
              setSelectedOrder(order);
              setShowPanel(true);
            }
          }}
           className={`flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg transition-colors ${
             selectedRows.size > 0 ? 'bg-green-600' : 'bg-slate-600'
           }`}>
            <span className="text-sm text-white font-bold">ສັ່ງຊື້({selectedRows.size})</span>
          </button>

          {/* cancel */}
          <button 
          onClick={() => setSelectedRows(new Set())}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 border border-gray-300 rounded-lg transition-colors">
            <span className="text-sm text-white font-bold">ຍົກເລີກ</span>
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  NIIN ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PR NUMBER ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PO NUMBER ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  CONTRACT ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  VENDOR ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  BRANCH ⇅
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  STATUS ⇅
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveries.map((delivery, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleRowClick(index)}
                  className={`cursor-pointer transition-colors ${
                    selectedRows.has(index) 
                      ? 'bg-green-100 hover:bg-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{delivery.niin}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{delivery.pr}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-slate-100 hover:text-blue-700 cursor-pointer">
                      {delivery.po}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{delivery.contract}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{delivery.vendor}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{delivery.branch}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={statusStyles[delivery.status] || 'text-gray-900'}>
                      {delivery.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">Showing 50 items</p>
        </div>
      </section>
      {showPanel && selectedOrder && (
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={() => setShowPanel(false)}
          onMarkDelivery={handleMarkDelivery}
        />
      )}
    </div>
  );
}