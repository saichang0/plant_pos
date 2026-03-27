"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon, SearchIcon,
  ArrowDownIcon,
  PlusIcon
} from '@/src/components/icons/page';

const statsCards = [
  { label: 'TOTAL PURCHASE ORDERS', value: '50', color: 'bg-white', textColor: 'text-gray-900' },
  { label: 'TOTAL ORDER QUANTITY', value: '12,457', color: 'bg-white', textColor: 'text-gray-900' },
  { label: 'TOTAL QTY RECEIVED', value: '6,370', color: 'bg-white', textColor: 'text-gray-900' },
  { label: 'OPEN / PENDING ORDERS', value: '22', color: 'bg-white', textColor: 'text-gray-900' },
  { label: 'OVERDUE DELIVERIES', value: '11', color: 'bg-white', textColor: 'text-gray-900' },
];

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

export default function ImportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const branches = ['All Branches', 'Army', 'Air Force', 'Navy', 'Marine Corps'];

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarIcon />
            </button>
            <button
              onClick={() => router.push('/dashboard/import/purchase')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <PlusIcon size={18} />
              <span className="text-sm font-medium text-gray-700">New Delivery</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/import/checkPurchase')}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <PlusIcon size={18} />
              <span className="text-sm font-medium">Log Delivery</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-2xl p-5 shadow-sm border border-gray-200`}
          >
            <p className={`text-xs uppercase tracking-wide mb-2 ${card.textColor === 'text-white' ? 'text-blue-100' : 'text-gray-500'}`}>
              {card.label}
            </p>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
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
                {branches.map((branch) => (
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
                ))}
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

          {/* Date Range */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CalendarIcon size={18} className="text-gray-600" />
            <span className="text-sm text-gray-700">Date Range</span>
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
                <tr key={index} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}