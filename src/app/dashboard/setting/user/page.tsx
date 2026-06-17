"use client";

import React, { useState, useEffect } from "react";
import { useCurrentUser, useUpdateUser } from "@/src/features/user/useUser";
import { useToast } from "@/src/components/toast";
import { CircleUser } from "@/src/components/icons/page";

export default function UserProfilePage() {
  const { user, loading, error, refetch } = useCurrentUser();
  const { submitting, updateUser } = useUpdateUser();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setShopName(user.shopName || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const result = await updateUser(user.id, { firstName, lastName, shopName });
    if (result.success) {
      showToast("ອັບເດດໂປຣຟາຍສຳເລັດແລ້ວ", "success");
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <span className="text-sm">ກຳລັງໂຫຼດ…</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2 text-rose-600">
        <div className="text-3xl">⚠️</div>
        <div className="text-sm">{error || "User not found"}</div>
      </div>
    );
  }

  const joinedDate = new Date(Number(user.createdAt)).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long" },
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
        <header>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            ໂປຣຟາຍ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ຂໍ້ມູນຜູ້ເຂົ້າໃຊ້ລະບົບ
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center shadow-sm">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-300 opacity-25" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                {user.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImageUrl}
                    alt={user.firstName}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
                    <CircleUser size={48} className="text-emerald-700" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-bold text-emerald-900">
                {user.firstName} {user.lastName}
              </h2>
              {user.shopName && (
                <span className="inline-flex mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-white/70 text-emerald-700 backdrop-blur">
                  🏪 {user.shopName}
                </span>
              )}
              <div className="mt-5 space-y-2 text-sm">
                <Row label="ບົດບາດ" value={user.role === "admin" ? "ຜູ້ບໍລິຫານ" : "ພະນັກງານ"} />
                <Row
                  label="ສະຖານະ"
                  value={
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        user.status === "ACTIVE"
                          ? "bg-emerald-200/60 text-emerald-800"
                          : "bg-rose-200/60 text-rose-800"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  }
                />
                <Row label="ເຂົ້າໃຊ້ຕັ້ງແຕ່" value={joinedDate} />
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              ຂໍ້ມູນສ່ວນຕົວ
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              ແກ້ໄຂຊື່ ແລະ ຂໍ້ມູນຮ້ານ
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="ຊື່"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="ປ້ອນຊື່"
                />
                <Field
                  label="ນາມສະກຸນ"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="ປ້ອນນາມສະກຸນ"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="ອີເມວ"
                  value={user.email || ""}
                  onChange={() => {}}
                  disabled
                />
                <Field
                  label="ເບີໂທ"
                  value={user.phoneNumber || ""}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <Field
                label="ຊື່ຮ້ານ"
                value={shopName}
                onChange={setShopName}
                placeholder="ປ້ອນຊື່ຮ້ານ"
              />
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-50"
              >
                {submitting ? "ກຳລັງບັນທຶກ…" : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-gray-50"
        }`}
      />
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-emerald-800/70">{label}</span>
      <span className="font-medium text-emerald-900">{value}</span>
    </div>
  );
}
