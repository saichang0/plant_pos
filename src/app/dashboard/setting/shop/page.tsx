"use client";

import { useState, useEffect } from "react";
import { BACKEND_URLS } from "@/src/lib/config";
import { useCurrentUser, useUpdateUser } from "@/src/features/user/useUser";
import { useToast } from "@/src/components/toast";
import { UploadIcon, SaveIcon } from "@/src/components/icons/page";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const baseUrl = BACKEND_URLS.local.replace("/graphql", "");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const result = await response.json();
  if (result.data?.url) return result.data.url;
  if (result.url) return result.url;
  throw new Error(result.message || "Upload failed");
}

export default function ShopSettingPage() {
  const { user, loading, refetch } = useCurrentUser();
  const { submitting, updateUser } = useUpdateUser();
  const { showToast } = useToast();

  const [shopName, setShopName] = useState("");
  const [bankImageFile, setBankImageFile] = useState<File | null>(null);
  const [bankImagePreview, setBankImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setShopName(user.shopName || "");
      setBankImagePreview(user.bankAccountImageUrl || null);
    }
  }, [user]);

  const handleBankImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setBankImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setUploading(true);
    try {
      let bankAccountImageUrl = user.bankAccountImageUrl;
      if (bankImageFile) {
        try {
          bankAccountImageUrl = await uploadImage(bankImageFile);
        } catch {
          showToast("ອັບໂຫຼດຮູບລົ້ມເຫຼວ", "error");
          return;
        }
      }
      const result = await updateUser(user.id, {
        shopName: shopName.trim(),
        bankAccountImageUrl,
      });
      if (result.success) {
        showToast("ບັນທຶກສຳເລັດ", "success");
        setBankImageFile(null);
        refetch();
      } else {
        showToast(result.message, "error");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-6">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            ຕັ້ງຄ່າຮ້ານ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ຈັດການຊື່ຮ້ານ ແລະ ຮູບບັນຊີທະນາຄານ
          </p>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <span className="text-sm">ກຳລັງໂຫຼດ…</span>
            </div>
          </div>
        ) : (
          <>
            {/* Shop name card */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                ຂໍ້ມູນຮ້ານ
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                ຊື່ນີ້ຈະປາກົດໃນລະບົບ ແລະ ໃບບິນ
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ຮ້ານ
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="ໃສ່ຊື່ຮ້ານ..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
            </section>

            {/* QR upload card */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">
                ຮູບ QR ບັນຊີທະນາຄານ
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                ປາກົດໃຫ້ລູກຄ້າສະແກນຕອນຊຳລະຜ່ານ QR
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleBankImageChange}
                className="hidden"
                id="bank-image-upload"
              />
              <label
                htmlFor="bank-image-upload"
                className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 hover:from-gray-100 hover:border-emerald-300 cursor-pointer transition-all overflow-hidden"
              >
                {bankImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bankImagePreview}
                    alt="Bank QR"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-md">
                      <UploadIcon size={24} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      ກົດເພື່ອອັບໂຫຼດຮູບ QR
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
                  </div>
                )}
              </label>
              {bankImagePreview && (
                <button
                  onClick={() => {
                    setBankImageFile(null);
                    setBankImagePreview(null);
                  }}
                  className="mt-2 text-xs text-rose-600 hover:underline"
                >
                  ລົບຮູບ
                </button>
              )}
            </section>

            {/* Save action */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={submitting || uploading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-50"
              >
                <SaveIcon size={18} />
                {submitting || uploading ? "ກຳລັງບັນທຶກ…" : "ບັນທຶກ"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
