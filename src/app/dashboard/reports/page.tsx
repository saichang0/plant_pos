"use client";
import React from 'react';

const reportItems = [
  { title: 'ລາຍງານເບຍ້ໄມ້', description: 'ສະແດງລາຍງານແບບລາຍງວັນ', type: 'plant' },
  { title: 'ລາຍງານການສັ່ງຊ້ຳ', description: 'ລາຍງານອໍເດີນຳເຂົ້າ', type: 'order' },
  { title: 'ລາຍງານນຳເຂົ້າເບຍ້ໄມ້', description: 'ລາຍງານສິນຄ້ານຳເຂົ້າ', type: 'import' },
  { title: 'ລາຍງານການຂາຍເບຍ້ໄມ້', description: 'ສະແດງການຂາຍແລະລາຍຮັບ', type: 'sale' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">ລາຍງານ</h1>
        <p className="text-slate-400 mt-2">ເລືອກລາຍງານທີ່ຈະສ້າງ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportItems.map((report) => (
          <div key={report.type} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:shadow-lg hover:shadow-green-400/10 transition-all">
            <h2 className="text-xl font-semibold text-white">{report.title}</h2>
            <p className="text-slate-300 mt-2">{report.description}</p>
            <button className="mt-4 px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/20 text-green-200">ເບິ່ງ</button>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white">ສ່ວນສຳຄັນ</h3>
        <p className="text-slate-300 mt-2">ລາຍງານເບຍ້ໄມ້, ການສັ່ງຊ້ຳ, ນຳເຂົ້າ ແລະ ການຂາຍສາມາດດຶງຂໍ້ມູນໄດ້ທີ່ນີ້.</p>
      </div>
    </div>
  );
}
