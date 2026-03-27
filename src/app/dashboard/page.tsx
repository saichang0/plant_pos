"use client";

import React from 'react';
import { 
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const stats = [
    {
      name: 'ຍອດຂາຍວັນນີ້',
      value: '₭ 2,450,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'ອໍເດີໃໝ່',
      value: '24',
      change: '+8',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'ລູກຄ້າ',
      value: '1,234',
      change: '+23',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'ສິນຄ້າ',
      value: '456',
      change: '-5',
      changeType: 'negative',
      icon: CubeIcon,
    },
  ];

  const recentOrders = [
    { id: '#12580', customer: 'ສຸລິຍະ ຈັນທະລາ', amount: '₭ 125,000', status: 'completed', time: '2 ນາທີກ່ອນ' },
    { id: '#12579', customer: 'ຄຳສະຫວັດ ພົມມະຈັນ', amount: '₭ 89,500', status: 'processing', time: '5 ນາທີກ່ອນ' },
    { id: '#12578', customer: 'ດວງດິນ ໄຊຍະສາລາ', amount: '₭ 234,000', status: 'completed', time: '10 ນາທີກ່ອນ' },
    { id: '#12577', customer: 'ສົມສະຫວັດ ວົງສະຫວ່າງ', amount: '₭ 67,800', status: 'pending', time: '15 ນາທີກ່ອນ' },
  ];

  const topProducts = [
    { name: 'ຕົ້ນໄມ້ສົບ', sales: 45, revenue: '₭ 450,000' },
    { name: 'ດອກໄມ້ໃບໃຫຍ່', sales: 38, revenue: '₭ 380,000' },
    { name: 'ກ້ວຍສົບ', sales: 32, revenue: '₭ 320,000' },
    { name: 'ພືດອາບນຸກ', sales: 28, revenue: '₭ 280,000' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">ໜ້າຫຼັກ</h1>
        <p className="text-slate-800 mt-2">ຍອດຂໍ້ມູນສະຫຼຸບຂອງລະບົບຂາຍສິນຄ້າ Plant POS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:shadow-2xl shadow-2xs transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.name}</p>
                <p className="text-slate-800 text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <stat.icon className="w-12 h-12 text-slate-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">ອໍເດີຫຼ້າສຸດ</h2>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              ເບິ່ງທັງໝົດ
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-700/50">
                  <th className="pb-3 text-slate-600 font-medium">ອໍເດີ</th>
                  <th className="pb-3 text-slate-600 font-medium">ລູກຄ້າ</th>
                  <th className="pb-3 text-slate-600 font-medium">ຈຳນວນ</th>
                  <th className="pb-3 text-slate-600 font-medium">ສະຖານະ</th>
                  <th className="pb-3 text-slate-600 font-medium">ເວລາ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 text-slate-800 font-medium">{order.id}</td>
                    <td className="py-4 text-slate-600">{order.customer}</td>
                    <td className="py-4 text-slate-800 font-medium">{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : order.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {order.status === 'completed' ? 'ສຳເລັດ' : 
                         order.status === 'processing' ? 'ດຳເນີນການ' : 'ລໍຖ້າ'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-sm">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">ສິນຄ້າຍອດນິຍົມ</h2>
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-slate-400 text-sm">{product.sales} ຊື່ນ</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">ດຳເນີນການດ່ວນ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all">
            <ShoppingCartIcon className="w-6 h-6 text-green-400" />
            <span className="text-slate-800 font-medium">ສ້າງອໍເດີໃໝ່</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all">
            <CubeIcon className="w-6 h-6 text-blue-400" />
            <span className="text-slate-800 font-medium">ເພີ່ມສິນຄ້າ</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all">
            <UserGroupIcon className="w-6 h-6 text-purple-400" />
            <span className="text-slate-800 font-medium">ເພີ່ມລູກຄ້າ</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all">
            <ChartBarIcon className="w-6 h-6 text-orange-400" />
            <span className="text-slate-800 font-medium">ລາຍງານ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
