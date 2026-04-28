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

  // ─── Filter ────────────────────────────────────────────────
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ─── Handlers ──────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
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

    if (editingCategory) {
      const result = await updateCategory(editingCategory.id, formName.trim());
      if (result.success) {
        showToast("ແກ້ໄຂໝວດໝູ່ສຳເລັດ", "success");
        closeModal();
        refetch();
      } else {
        showToast(result.message, "error");
      }
    } else {
      const result = await createCategory(formName.trim());
      if (result.success) {
        showToast("ເພີ່ມໝວດໝູ່ສຳເລັດ", "success");
        closeModal();
        refetch();
      } else {
        showToast(result.message, "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteCategory(deleteConfirm.id);
    if (result.success) {
      showToast("ລຶບໝວດໝູ່ສຳເລັດ", "success");
      setDeleteConfirm(null);
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("lo-LA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ຈັດການໝວດໝູ່</h1>
          <p className="text-sm text-gray-500 mt-1">
            ທັງໝົດ {categories.length} ໝວດໝູ່
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          <FaPlus className="w-3.5 h-3.5" />
          ເພີ່ມໝວດໝູ່
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ຄົ້ນຫາໝວດໝູ່..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ກຳລັງໂຫຼດ...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີຂໍ້ມູນໝວດໝູ່</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-900">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    #
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ຊື່ໝວດໝູ່
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ສ້າງໂດຍ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ວັນທີສ້າງ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ສິນຄ້າ
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cat.creator
                        ? `${cat.creator.firstName} ${cat.creator.lastName}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(cat.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {cat.products?.length || 0} ລາຍການ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ແກ້ໄຂ"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ id: cat.id, name: cat.name })
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ລຶບ"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* Create / Edit Modal */}
      {/* ════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? "ແກ້ໄຂໝວດໝູ່" : "ເພີ່ມໝວດໝູ່ໃໝ່"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ໝວດໝູ່
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ໃສ່ຊື່ໝວດໝູ່..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating || updating}
                className="flex-1 py-2.5 bg-emerald-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 disabled:bg-gray-300"
              >
                {creating || updating
                  ? "ກຳລັງບັນທຶກ..."
                  : editingCategory
                  ? "ບັນທຶກ"
                  : "ເພີ່ມ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* Delete Confirmation Modal */}
      {/* ════════════════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <WarningIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ຢືນຢັນການລຶບ
              </h3>
              <p className="text-sm text-gray-500">
                ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່{" "}
                <span className="font-semibold text-gray-800">
                  &quot;{deleteConfirm.name}&quot;
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300"
              >
                {deleting ? "ກຳລັງລຶບ..." : "ລຶບ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
