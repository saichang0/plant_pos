"use client";

import { AsyncIcon, CheckIcon, CloseIcon, DotThreeIcon, ListIcon } from '@/src/components/icons/page';
import OrderDetailsPanel from '@/src/components/OrderDetailsPanel';
import React from 'react';
import { MdExpandMore } from 'react-icons/md';
import { COLORS } from '@/src/lib/colors';

const OrderDashboard = () => {
  const [menuOrderId, setMenuOrderId] = React.useState<string | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<{ id: string; customer: string; date: string; status: string; items: string; total: string; statusColor: string; } | null>(null);
  const [deliveryToast, setDeliveryToast] = React.useState<string | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);

  const openMenuForOrder = (order: { id: string; customer: string; date: string; status: string; items: string; total: string; statusColor: string; }) => {
    if (menuOrderId === order.id) {
      setMenuOrderId(null);
      return;
    }
    setMenuOrderId(order.id);
  };

  const closeMenu = () => setMenuOrderId(null);

  const openDetails = (order: { id: string; customer: string; date: string; status: string; items: string; total: string; statusColor: string; }) => {
    setSelectedOrder(order);
    setIsDetailPanelOpen(true);
    setMenuOrderId(null);
  };

  const handleDelivery = (order: { id: string; customer: string; date: string; status: string; items: string; total: string; statusColor: string; }) => {
    setMenuOrderId(null);
    setIsDetailPanelOpen(false);
    setSelectedOrder(null);

    const message = `ການຈັດສົ່ງສຳລັບ ${order.id} (${order.customer} ສຳເລັດແລ້ວ)`;
    setDeliveryToast(message);

    window.setTimeout(() => {
      setDeliveryToast(null);
    }, 1000); 
  };

  const closeDetails = () => {
    setIsDetailPanelOpen(false);
    setSelectedOrder(null);
  };

  const summary = [
    { key: "new", title: "New Orders", value: "13", icon: <ListIcon className="text-gray-400" size={32} />, color: "from-white to-white" },
    { key: "transit", title: "In Transit", value: "8", icon: <AsyncIcon className="text-gray-400" size={32} />, color: "from-white to-white" },
    { key: "delivered", title: "Delivered", value: "28", icon: <CheckIcon className="text-gray-400" size={32} />, color: "from-white to-white" },
    { key: "cancelled", title: "Cancelled", value: "3", icon: <CloseIcon className="text-gray-400" size={32} />, color: "from-white to-white" },
  ];

  const orders = [
    { id: "#1023", customer: "Asha R.", date: "2025-07-15", status: "Shipping", items: "5 items", total: "1,234.56", statusColor: "bg-emerald-400" },
    { id: "#1024", customer: "Ramesh P.", date: "2025-07-15", status: "Processing", items: "2 items", total: "1,234.56", statusColor: "bg-orange-400" },
    { id: "#1025", customer: "Neha S.", date: "2025-07-15", status: "Cancelled", items: "3 items", total: "1,234.56", statusColor: "bg-red-500" },
    { id: "#1026", customer: "Rahul R.", date: "2025-07-15", status: "Complete", items: "4 items", total: "1,234.56", statusColor: "bg-teal-800" },
  ];

  const allStatuses = Array.from(new Set(orders.map(order => order.status)));
  
  const filteredOrders = selectedStatus 
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summary.map((card) => (
            <article
              key={card.key}
              className="relative group bg-white border border-gray-100 rounded-3xl p-2 flex flex-col items-center text-center hover:shadow-2xl shadow-sm transition-all duration-200 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className="p-2">
                {card.icon}
              </div>
            </article>
          ))}
        </section>

        {/* Table Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Order</h2>
            <div className="flex gap-3">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 bg-[#062d24] text-white px-4 py-2 rounded-full text-sm font-medium"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  Status {selectedStatus && `(${selectedStatus})`} <MdExpandMore />
                </button>
                
                {isStatusDropdownOpen && (
                  <div className="absolute top-12 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                    <button
                      onClick={() => {
                        setSelectedStatus(null);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All Statuses
                    </button>
                    {allStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedStatus === status
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="flex items-center gap-2 bg-[#062d24] text-white px-4 py-2 rounded-full text-sm font-medium">
                Date Range <MdExpandMore />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-50">
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">{order.id}</td>
                    <td className="px-6 py-5 font-medium">{order.customer}</td>
                    <td className="px-6 py-5 text-gray-500">{order.date}</td>
                    <td className="px-6 py-5">
                      <span className={`${order.statusColor} text-white px-4 py-1 rounded-lg text-xs font-semibold`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">{order.items}</td>
                    <td className="px-6 py-5 font-semibold text-gray-900">{order.total}</td>
                    <td className="px-6 py-5 relative">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => openMenuForOrder(order)}
                      >
                        <DotThreeIcon size={20} />
                      </button>

                      {menuOrderId === order.id && (
                        <div className="absolute z-20 top-10 right-0 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                          <button
                            onClick={() => openDetails(order)}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View detail
                          </button>
                          <button
                            onClick={() => handleDelivery(order)}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Delivery
                          </button>
                          <button
                            onClick={closeMenu}
                            className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {isDetailPanelOpen && selectedOrder && (
          <OrderDetailsPanel
            order={selectedOrder}
            onClose={closeDetails}
            onMarkDelivery={handleDelivery}
          />
        )}
        {deliveryToast && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg">
              {deliveryToast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;