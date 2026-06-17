"use client";

import { useSearchParams, useRouter } from "next/navigation";
import PlantForm from "@/src/components/plantForm";

export default function UpdateStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        <header className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 flex items-center justify-center transition"
            title="ກັບຄືນ"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ແກ້ໄຂສິນຄ້າ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ປັບຂໍ້ມູນສິນຄ້າ ແລະ ບັນທຶກ
            </p>
          </div>
        </header>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-6">
          <PlantForm productId={productId} />
        </div>
      </div>
    </div>
  );
}
