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

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setShopName(user.shopName || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const result = await updateUser(user.id, {
      firstName,
      lastName,
      shopName,
    });

    if (result.success) {
      showToast("ອັບເດດໂປຣຟາຍສຳເລັດແລ້ວ", "success");
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">{error || "User not found"}</div>
      </div>
    );
  }

  const joinedDate = new Date(Number(user.createdAt)).toLocaleDateString("lo-LA", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">ໂປຣຟາຍ</h1>
        <p className="text-gray-500">ຂໍ້ມູນໂປຣຟາຍຂອງຜູ້ເຂົ້າໃຊ້ລະບົບ</p>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="flex justify-center mb-4">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                <CircleUser size={48} className="text-emerald-700" />
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h2>

          {user.shopName && (
            <span className="inline-flex mt-2 px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
              {user.shopName}
            </span>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-700">ບົດບາດ:</span>{" "}
              {user.role === "admin" ? "ຜູ້ບໍລິຫານ" : "ພະນັກງານ"}
            </p>
            <p>
              <span className="font-medium text-gray-700">ສະຖານະ:</span>{" "}
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">ເຂົ້າໃຊ້ຕັ້ງແຕ່:</span>{" "}
              {joinedDate}
            </p>
          </div>
        </div>

        {/* Right - Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">ຂໍ້ມູນສ່ວນຕົວ</h3>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ປ້ອນຊື່"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ນາມສະກຸນ
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ປ້ອນນາມສະກຸນ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ອີເມວ
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ເບີໂທ
                </label>
                <input
                  type="text"
                  value={user.phoneNumber || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ຮ້ານ
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="ປ້ອນຊື່ຮ້ານ"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="w-full px-5 py-3 text-sm font-medium text-white bg-emerald-900 rounded-xl hover:bg-emerald-950 transition-colors disabled:opacity-50"
            >
              {submitting ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
