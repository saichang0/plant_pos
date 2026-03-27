"use client";
import React from 'react';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">ຂາຍເບຍ້ໄມ້</h1>
        <p className="text-slate-400 mt-2">ບັນທຶກຂາຍເບຍ້ໄມ້ ເລືອກເບຍ້ໄມ້ ແລະ ຊຳລະເງິນ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-xl text-white font-semibold">ເລືອກເບຍ້ໄມ້</h2>
          <p className="text-slate-300 mt-2">ຄົ້ນຫາແລະເລືອກສິນຄ້າທີ່ຈະຂາຍ</p>
          <button className="mt-4 px-4 py-2 border border-blue-500/30 bg-blue-500/20 text-blue-200 rounded-lg">ເລືອກເບຍ້ໄມ້</button>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-xl text-white font-semibold">ບັນທຶກການຂາຍ</h2>
          <p className="text-slate-300 mt-2">ຮັບການສັ່ງແລະຢືນຢັນການຂາຍ</p>
          <button className="mt-4 px-4 py-2 border border-green-500/30 bg-green-500/20 text-green-200 rounded-lg">ບັນທຶກ</button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white">ລາຍການການຊຳລະເງິນ</h3>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400 border-b border-slate-700/50">
              <tr>
                <th className="py-2">ລະຫັດ</th>
                <th className="py-2">ລູກຄ້າ</th>
                <th className="py-2">ຈຳນວນ</th>
                <th className="py-2">ເງິນ</th>
                <th className="py-2">ແຖວ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {[{ id: '#S1001', customer: 'ອ້າຍ ທ້າວ', qty: '5', amount: '250,000', payment: 'ສົດ' }].map((row) => (
                <tr key={row.id} className="hover:bg-slate-700/30">
                  <td className="py-2 text-white">{row.id}</td>
                  <td className="py-2 text-slate-300">{row.customer}</td>
                  <td className="py-2 text-slate-300">{row.qty}</td>
                  <td className="py-2 text-slate-300">{row.amount}</td>
                  <td className="py-2"><span className="px-2 py-1 rounded-full bg-teal-500/20 text-teal-300">{row.payment}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
