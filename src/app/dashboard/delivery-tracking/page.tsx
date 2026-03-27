"use client";
import React from 'react';

export default function DeliveryTrackingPage() {
  const items = [
    { id: '#D1001', order: '#2001', status: 'ກຳລັງຈັດສົ່ງ', eta: '1 ມື້' },
    { id: '#D1002', order: '#2002', status: 'ສົ່ງແລ້ວ', eta: 'ແລ້ວ' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">ຕິດຕາມການສົ່ງ</h1>
        <p className="text-slate-400 mt-2">ກວດສອບສະຖານະການສົ່ງ ແລະ ແຈ້ງເຕືອນ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">ກວດສອບສະຖານະ</h2>
          <p className="text-slate-300 mt-2">ສະແດງການຄວາມຫນ້າຂອງການສົ່ງຢ່າງລ່ວງໜ້າ</p>
          <button className="mt-4 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-emerald-200">ປັບປຸງສະຖານະ</button>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">ແຈ້ງເຕືອນ</h2>
          <p className="text-slate-300 mt-2">ຕັ້ງຄ່າການແຈ້ງເຕືອນເວລາຫຼັງ</p>
          <button className="mt-4 px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/20 text-indigo-200">ຕັ້ງຄ່າ</button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white">ລາຍການການສົ່ງ</h3>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400 border-b border-slate-700/50">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">ອໍເດີ</th>
                <th className="py-2">ສະຖານະ</th>
                <th className="py-2">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-700/30">
                  <td className="py-2 text-white">{row.id}</td>
                  <td className="py-2 text-slate-300">{row.order}</td>
                  <td className="py-2 text-slate-300">{row.status}</td>
                  <td className="py-2 text-slate-300">{row.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
