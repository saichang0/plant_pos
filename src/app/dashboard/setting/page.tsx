"use client";

import {
  BankIcon,
  CircleUser,
  GridIcon,
  HomeIcon,
  UserPlusIcon,
} from "@/src/components/icons/page";
import { useRouter } from "next/navigation";
import React from "react";

type Tone = "emerald" | "blue" | "purple" | "rose" | "orange";

interface Item {
  title: string;
  desc: string;
  icon: React.ReactNode;
  link: string;
  isNew?: boolean;
  tone: Tone;
}

const PALETTE: Record<Tone, { bg: string; blob: string; chip: string; text: string }> = {
  emerald: {
    bg: "from-emerald-50 to-emerald-100",
    blob: "bg-emerald-300",
    chip: "bg-white/70 text-emerald-700",
    text: "text-emerald-900",
  },
  blue: {
    bg: "from-blue-50 to-blue-100",
    blob: "bg-blue-300",
    chip: "bg-white/70 text-blue-700",
    text: "text-blue-900",
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    blob: "bg-purple-300",
    chip: "bg-white/70 text-purple-700",
    text: "text-purple-900",
  },
  rose: {
    bg: "from-rose-50 to-rose-100",
    blob: "bg-rose-300",
    chip: "bg-white/70 text-rose-700",
    text: "text-rose-900",
  },
  orange: {
    bg: "from-orange-50 to-amber-100",
    blob: "bg-orange-300",
    chip: "bg-white/70 text-orange-700",
    text: "text-orange-900",
  },
};

const SettingsPage = () => {
  const router = useRouter();

  const items: Item[] = [
    {
      title: "ໂປຣຟາຍ",
      desc: "ຂໍ້ມູນໂປຣຟາຍຂອງຜູ້ເຂົ້າໃຊ້ລະບົບ",
      icon: <CircleUser size={28} />,
      link: "/dashboard/setting/user",
      tone: "blue",
    },
    {
      title: "ປະເພດສິນຄ້າ",
      desc: "ເພີ່ມຕັ້ງຄ່າປະເພດ ສິນຄ້າ ໃນຮ້ານ",
      icon: <GridIcon size={28} />,
      link: "/dashboard/setting/category",
      tone: "emerald",
    },
    {
      title: "ຜູ້ສະໜອງ",
      desc: "ກຳນົດຂໍ້ມູນຜູ້ສະໜອງ",
      icon: <UserPlusIcon size={28} />,
      link: "/dashboard/setting/supplier",
      tone: "purple",
    },
    // {
    //   title: "ບັນຊີ",
    //   desc: "ຈັດການບັນຊີທະນະຄານ",
    //   icon: <BankIcon size={28} />,
    //   link: "/dashboard/setting/bank",
    //   tone: "orange",
    // },
    {
      title: "ຕັ້ງຄ່າຮ້ານ",
      desc: "ຂໍ້ມູນຮ້ານ, ໂລໂກ້, QR ບັນຊີ",
      icon: <HomeIcon size={28} />,
      link: "/dashboard/setting/shop",
      isNew: true,
      tone: "rose",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">ຕັ້ງຄ່າ</h1>
          <p className="text-sm text-gray-500 mt-1">ຈັດການລະບົບ ແລະ ຂໍ້ມູນຮ້ານ</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const p = PALETTE[item.tone];
            return (
              <article
                key={i}
                onClick={() => router.push(item.link)}
                className={`group relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl shadow-sm bg-gradient-to-br ${p.bg}`}
              >
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-25 ${p.blob}`} />
                {item.isNew && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-rose-500 shadow-sm">
                    ໃໝ່
                  </span>
                )}

                <div className="relative flex items-start gap-4">
                  <div className={`shrink-0 w-14 h-14 rounded-2xl ${p.chip} flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold ${p.text}`}>{item.title}</h3>
                    <p className={`text-sm mt-1 ${p.text} opacity-70`}>{item.desc}</p>
                  </div>
                </div>

                <div className="relative mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-gray-700 opacity-70 group-hover:opacity-100 transition">
                  ເປີດ
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
