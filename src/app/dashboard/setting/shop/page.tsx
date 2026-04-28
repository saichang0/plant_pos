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
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">ກຳລັງໂຫຼດ...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">ຕັ້ງຄ່າຮ້ານ</h1>
        <p className="text-slate-500 mt-1">ຈັດການຊື່ຮ້ານ ແລະ ຮູບບັນຊີທະນາຄານ</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ຊື່ຮ້ານ
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="ໃສ່ຊື່ຮ້ານ..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">ຊື່ນີ້ຈະປາກົດຢູ່ໜ້າຕົ້ນຂອງລະບົບ</p>
        </div>

        {/* Bank Account Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ຮູບ QR ບັນຊີທະນາຄານ
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleBankImageChange}
            className="hidden"
            id="bank-image-upload"
          />
          <label
            htmlFor="bank-image-upload"
            className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            {bankImagePreview ? (
              <img
                src={bankImagePreview}
                alt="Bank QR"
                className="h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-700 rounded-full flex items-center justify-center">
                  <UploadIcon size={24} className="text-white" />
                </div>
                <p className="text-sm text-gray-600">ກົດເພື່ອອັບໂຫຼດຮູບ QR</p>
              </div>
            )}
          </label>
          <p className="text-xs text-gray-400 mt-1">ຮູບນີ້ຈະປາກົດໃຫ້ລູກຄ້າສະແກນຕອນຊຳລະ</p>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={submitting || uploading}
            className="flex items-center gap-2 px-8 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            <SaveIcon size={18} />
            {submitting || uploading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
          </button>
        </div>
      </div>
    </div>
  );
}
