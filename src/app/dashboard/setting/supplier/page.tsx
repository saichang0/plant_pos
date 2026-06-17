"use client";

import React, { useState } from "react";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/src/features/supplier/useSupplier";
import type { Supplier } from "@/src/features/supplier/useSupplier";
import {
  SearchIcon,
  UserPlusIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
} from "@/src/components/icons/page";
import { useToast } from "@/src/components/toast";
import { FaTimes } from "react-icons/fa";

export default function SupplierPage() {
  const { suppliers, loading, error, refetch } = useSuppliers();
  const { formData, setFormData, submitting, createSupplier, resetForm } =
    useCreateSupplier();
  const { submitting: updating, updateSupplier } = useUpdateSupplier();
  const { submitting: deleting, deleteSupplier } = useDeleteSupplier();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(
    null,
  );

  const filtered = suppliers.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.phoneNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    resetForm();
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleCreate = async () => {
    const r = await createSupplier();
    if (r.success) {
      showToast("ເພີ່ມຜູ້ສະໜອງສຳເລັດ", "success");
      setShowModal(false);
      refetch();
    } else showToast(r.message, "error");
  };

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      phoneNumber: s.phoneNumber,
      email: s.email,
      address: s.address,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingSupplier) return;
    const r = await updateSupplier(editingSupplier.id, formData);
    if (r.success) {
      showToast("ແກ້ໄຂສຳເລັດ", "success");
      setShowModal(false);
      setEditingSupplier(null);
      refetch();
    } else showToast(r.message, "error");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const r = await deleteSupplier(deleteConfirm.id);
    setDeleteConfirm(null);
    if (r.success) {
      showToast("ລົບສຳເລັດ", "success");
      refetch();
    } else showToast(r.message, "error");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ຜູ້ສະໜອງ
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ທັງໝົດ {suppliers.length} ຜູ້ສະໜອງ
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition"
          >
            <UserPlusIcon size={16} />
            ເພີ່ມຜູ້ສະໜອງ
          </button>
        </header>

        {/* Search */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="relative max-w-md">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່, ເບີໂທ, ອີເມວ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <section className="space-y-2">
          {loading ? (
            <Empty>
              <Spinner />
              <p className="text-sm mt-3 text-gray-500">ກຳລັງໂຫຼດ…</p>
            </Empty>
          ) : error ? (
            <Empty tone="rose">
              <div className="text-3xl">⚠️</div>
              <div className="text-sm">{error}</div>
            </Empty>
          ) : filtered.length === 0 ? (
            <Empty>
              <div className="text-6xl">📭</div>
              <div className="text-sm text-gray-400">ບໍ່ມີຜູ້ສະໜອງ</div>
            </Empty>
          ) : (
            filtered.map((s) => {
              const initial = s.name?.[0]?.toUpperCase() ?? "?";
              return (
                <article
                  key={s.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500" />
                  <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 font-bold text-lg flex items-center justify-center ring-1 ring-white">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {s.name}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        {s.phoneNumber && <span>📞 {s.phoneNumber}</span>}
                        {s.email && (
                          <span className="truncate max-w-[200px]">✉ {s.email}</span>
                        )}
                        {s.address && (
                          <span className="truncate max-w-[200px]">
                            📍 {s.address}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ id: s.id, name: s.name })
                        }
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSupplier ? "ແກ້ໄຂຜູ້ສະໜອງ" : "ເພີ່ມຜູ້ສະໜອງໃໝ່"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              <Field
                label="ຊື່ຜູ້ສະໜອງ"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
                placeholder="ປ້ອນຊື່"
              />
              <Field
                label="ເບີໂທ"
                value={formData.phoneNumber}
                onChange={(v) => setFormData({ ...formData, phoneNumber: v })}
                placeholder="ປ້ອນເບີໂທ"
              />
              <Field
                label="ອີເມວ"
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                placeholder="example@mail.com"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ທີ່ຢູ່
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="ປ້ອນທີ່ຢູ່"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={editingSupplier ? handleUpdate : handleCreate}
                disabled={submitting || updating || !formData.name || !formData.phoneNumber}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
              >
                {submitting || updating ? "ກຳລັງບັນທຶກ…" : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                <WarningIcon size={28} className="text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ຢືນຢັນການລົບ
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ລົບຜູ້ສະໜອງ{" "}
              <span className="font-semibold text-gray-800">
                &quot;{deleteConfirm.name}&quot;
              </span>{" "}
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "ກຳລັງລົບ…" : "ລົບ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
      />
    </div>
  );
}

function Empty({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "rose";
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border py-16 text-center ${
        tone === "rose" ? "border-rose-100" : "border-gray-100"
      }`}
    >
      <div
        className={`flex flex-col items-center gap-2 ${
          tone === "rose" ? "text-rose-600" : "text-gray-400"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
  );
}
