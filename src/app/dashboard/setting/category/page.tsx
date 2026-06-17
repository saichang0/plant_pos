"use client";

import React, { useState } from "react";
import {
  useCategoryList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/src/features/category/useCategory";
import type { Category } from "@/src/features/category/useCategory";
import {
  SearchIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
} from "@/src/components/icons/page";
import { useToast } from "@/src/components/toast";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function CategoryPage() {
  const { categories, loading, error, refetch } = useCategoryList();
  const { submitting: creating, createCategory } = useCreateCategory();
  const { submitting: updating, updateCategory } = useUpdateCategory();
  const { submitting: deleting, deleteCategory } = useDeleteCategory();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formName, setFormName] = useState("");

  const filtered = categories.filter((c) =>
    !searchQuery ? true : c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormName("");
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showToast("ກະລຸນາໃສ່ຊື່ໝວດໝູ່", "error");
      return;
    }
    const result = editingCategory
      ? await updateCategory(editingCategory.id, formName.trim())
      : await createCategory(formName.trim());
    if (result.success) {
      showToast(editingCategory ? "ແກ້ໄຂສຳເລັດ" : "ເພີ່ມສຳເລັດ", "success");
      closeModal();
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const r = await deleteCategory(deleteConfirm.id);
    if (r.success) {
      showToast("ລຶບສຳເລັດ", "success");
      setDeleteConfirm(null);
      refetch();
    } else {
      showToast(r.message, "error");
    }
  };

  const formatDate = (s: string) => {
    if (!s) return "-";
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const totalProducts = categories.reduce(
    (s, c) => s + (c.products?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              ຈັດການໝວດໝູ່
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ປະເພດສິນຄ້າ ໃນຮ້ານ ({categories.length})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                ສິນຄ້າທັງໝົດ
              </div>
              <div className="text-xl font-bold text-gray-900">{totalProducts}</div>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold shadow-sm hover:from-emerald-700 hover:to-emerald-800 transition"
            >
              <FaPlus className="w-3.5 h-3.5" />
              ເພີ່ມໝວດໝູ່
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາໝວດໝູ່..."
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
            <EmptyState>
              <Spinner />
              <p className="text-sm mt-3">ກຳລັງໂຫຼດ…</p>
            </EmptyState>
          ) : error ? (
            <EmptyState tone="rose">
              <div className="text-3xl">⚠️</div>
              <div className="text-sm">{error}</div>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              <div className="text-6xl">📭</div>
              <div className="text-sm">ບໍ່ມີຂໍ້ມູນ</div>
            </EmptyState>
          ) : (
            filtered.map((cat) => {
              const count = cat.products?.length || 0;
              return (
                <article
                  key={cat.id}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-xl ring-1 ring-white">
                      📁
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {cat.name}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                          {count} ສິນຄ້າ
                        </span>
                        {cat.creator && (
                          <span>
                            👤 {cat.creator.firstName} {cat.creator.lastName}
                          </span>
                        )}
                        <span>📅 {formatDate(cat.createdAt)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                        title="ແກ້ໄຂ"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ id: cat.id, name: cat.name })
                        }
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                        title="ລຶບ"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ຊື່ໝວດໝູ່
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="ໃສ່ຊື່ໝວດໝູ່..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating || updating}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
              >
                {creating || updating
                  ? "ກຳລັງບັນທຶກ…"
                  : editingCategory
                    ? "ບັນທຶກ"
                    : "ເພີ່ມ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                <WarningIcon className="w-7 h-7 text-rose-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ຢືນຢັນການລຶບ
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              ລຶບໝວດໝູ່{" "}
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
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "ກຳລັງລຶບ…" : "ລຶບ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
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
