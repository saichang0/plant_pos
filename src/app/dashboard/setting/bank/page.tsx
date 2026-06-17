"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/src/components/toast";
import {
  BankAccount,
  uploadBankImage,
  useBankAccounts,
  useCreateBankAccount,
  useDeleteBankAccount,
  useUpdateBankAccount,
} from "@/src/features/bank/useBank";

export default function BankAccountsPage() {
  const { accounts, loading, error, refetch } = useBankAccounts();
  const { submitting: creating, create } = useCreateBankAccount();
  const { submitting: updating, update } = useUpdateBankAccount();
  const { submitting: deleting, remove } = useDeleteBankAccount();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [bankName, setBankName] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setBankName("");
    setQrFile(null);
    setQrPreview(null);
    setModalOpen(true);
  };

  const openEdit = (acc: BankAccount) => {
    setEditing(acc);
    setBankName(acc.bankName);
    setQrFile(null);
    setQrPreview(acc.qrImageUrl);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!qrFile) return;
    const url = URL.createObjectURL(qrFile);
    setQrPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [qrFile]);

  const handleSave = async () => {
    if (!bankName.trim()) {
      showToast("ກະລຸນາໃສ່ຊື່ທະນາຄານ", "error");
      return;
    }

    let qrImageUrl: string | undefined = editing?.qrImageUrl;
    if (qrFile) {
      try {
        setUploading(true);
        qrImageUrl = await uploadBankImage(qrFile);
      } catch (e: any) {
        setUploading(false);
        showToast(e.message || "Upload failed", "error");
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!qrImageUrl) {
      showToast("ກະລຸນາອັບໂຫລດ QR ຂອງທະນາຄານ", "error");
      return;
    }

    if (editing) {
      const result = await update(editing.id, {
        bankName: bankName.trim(),
        qrImageUrl,
      });
      if (result.success) {
        showToast("ອັບເດດບັນຊີສຳເລັດ", "success");
        setModalOpen(false);
        refetch();
      } else {
        showToast(result.message || "Update failed", "error");
      }
    } else {
      const result = await create({ bankName: bankName.trim(), qrImageUrl });
      if (result.success) {
        showToast("ເພີ່ມບັນຊີສຳເລັດ", "success");
        setModalOpen(false);
        refetch();
      } else {
        showToast(result.message || "Create failed", "error");
      }
    }
  };

  const handleDelete = async (acc: BankAccount) => {
    if (!confirm(`ລົບບັນຊີ ${acc.bankName} ?`)) return;
    const result = await remove(acc.id);
    if (result.success) {
      showToast("ລົບບັນຊີສຳເລັດ", "success");
      refetch();
    } else {
      showToast(result.message || "Delete failed", "error");
    }
  };

  const busy = creating || updating || uploading;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ບັນຊີທະນະຄານ</h1>
          <p className="text-gray-500">
            ຈັດການບັນຊີທະນະຄານສຳລັບຮັບເງິນ (JDB, LDB, BCEL, ອື່ນໆ)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors"
        >
          + ເພີ່ມບັນຊີ
        </button>
      </header>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center text-gray-500">
              ຍັງບໍ່ມີບັນຊີທະນະຄານ — ກົດ &quot;ເພີ່ມບັນຊີ&quot; ເພື່ອເພີ່ມບັນຊີໃໝ່
            </div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {acc.bankName}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(acc)}
                      className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      ແກ້ໄຂ
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      disabled={deleting}
                      className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      ລົບ
                    </button>
                  </div>
                </div>
                <div className="flex justify-center bg-gray-50 rounded-xl p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={acc.qrImageUrl}
                    alt={acc.bankName}
                    className="w-full max-w-[220px] aspect-square object-contain"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "ແກ້ໄຂບັນຊີ" : "ເພີ່ມບັນຊີໃໝ່"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ທະນະຄານ
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="ເຊັ່ນ JDB, LDB, BCEL"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="bank-qr-upload"
                  className="hidden"
                  onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="bank-qr-upload"
                  className="block border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  {qrPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrPreview}
                      alt="preview"
                      className="mx-auto max-h-48 object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      ກົດເພື່ອອັບໂຫລດ QR
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSave}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 disabled:opacity-50"
              >
                {busy ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
