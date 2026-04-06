"use client";

import { AboutIcon, AwardIcon, BankIcon, CircleUser, DollarIcon, GridIcon, HomeIcon, LanguageIcon, ListIcon, PrintIcon, ProtectIcon, UserPlusIcon } from '@/src/components/icons/page';
import { useRouter } from 'next/navigation';
import React from 'react';

const SettingsPage = () => {
  const router = useRouter();
  const settingsItems = [
    { title: "ໂປຣຟາຍ", desc: "ຂໍ້ມູນໂປຣຟາຍຂອງຜູ້ເຂົ້າໃຊ້ລະບົບ", icon: <CircleUser size={32} />, link: "/dashboard/setting/user" },
    { title: "ປະເພດສິນຄ້າ", desc: "ເພີ່ມຕັ້ງຄ່າປະເພດ ສິນຄ້າ ໃນຮ້ານຂອງທ່ານ", icon: <GridIcon size={32} /> },
    { title: "ແບຣນ", desc: "ຈັດການ ຕັ້ງຄ່າແບຣນ", icon: <AboutIcon size={32} /> },
    { title: "ເລດເງິນ", desc: "ກຳນົດເລດເງິນໃນການຂາຍສິນຄ້າ", icon: <DollarIcon size={32} /> },
    { title: "ຜູ້ສະໜອງ", desc: "ກຳນົດຂໍ້ມູນຜູ້ສະໜອງ", icon: <UserPlusIcon size={32} />, link: "/dashboard/setting/supplier" },
    { title: "ພາສາ", desc: "ກຳນົດພາສາໃນລະບົບ", icon: <LanguageIcon size={32} /> },
    { title: "ຕັ້ງຄ່າຮ້ານ", desc: "ຂໍ້ມູນກ່ຽວກັບການຂາຍ", icon: <HomeIcon size={32} />, isNew: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Title Section */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">ຕັ້ງຄ່າ</h1>
          <p className="text-gray-500">ຂໍ້ມູນການຕັ້ງຄ່າ</p>
        </header>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settingsItems.map((item, index) => (
            <div
              key={index}
              onClick={() => item.link && router.push(item.link)}
              className="relative group bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center hover:shadow-2xl shadow-sm transition-all duration-200 cursor-pointer"
            >
              {/* "New" Badge */}
              {item.isNew && (
                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-tl-lg rounded-br-lg uppercase tracking-wider">
                  New
                </div>
              )}

              {/* Icon Container */}
              <div className="mb-4 text-gray-700 group-hover:text-emerald-900 transition-colors">
                {item.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;