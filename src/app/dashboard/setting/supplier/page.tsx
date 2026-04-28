"use client";

import React, { useState } from "react";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/src/features/supplier/useSupplier";
import type { Supplier, SupplierFormData } from "@/src/features/supplier/useSupplier";
import {
  SearchIcon,
  UserPlusIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
} from "@/src/components/icons/page";
import { useToast } from "@/src/components/toast";

export default function SupplierPage() {
  const { suppliers, loading, error, refetch } = useSuppliers();
  const {
    formData,
    setFormData,
    submitting,
    createSupplier,
    resetForm,
  } = useCreateSupplier();
  const { submitting: updating, updateSupplier } = useUpdateSupplier();
  const { submitting: deleting, deleteSupplier } = useDeleteSupplier();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(q) ||
      supplier.phoneNumber.toLowerCase().includes(q) ||
      supplier.email.toLowerCase().includes(q) ||
      supplier.address.toLowerCase().includes(q)
    );
  });

  const handleSearch = () => {
    // triggers re-render with current searchQuery, filtering is handled above
    setSearchQuery(searchQuery);
  };

  const handleCreate = async () => {
    const result = await createSupplier();
    if (result.success) {
      setShowModal(false);
      refetch();
    } else {
      alert(result.message);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email,
      address: supplier.address,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!editingSupplier) return;
    const result = await updateSupplier(editingSupplier.id, formData);
    if (result.success) {
      setShowModal(false);
      setEditingSupplier(null);
      refetch();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const result = await deleteSupplier(deleteConfirm.id);
    setDeleteConfirm(null);
    if (result.success) {
      showToast("ລົບຜູ້ສະໜອງສຳເລັດແລ້ວ", "success");
      refetch();
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ຜູ້ສະໜອງທັງໝົດ</h1>
          <p className="text-slate-500 mt-1">
            ທັງໝົດ {filteredSuppliers.length} ຜູ້ສະໜອງ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setEditingSupplier(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-950 text-white rounded-xl hover:bg-emerald-900 transition-colors"
          >
            <UserPlusIcon size={18} />
            ເພີ່ມຜູ້ສະໜອງ
          </button>
        </div>
      </div>

      {/* Search */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່, ເບີໂທ, ອີເມວ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-emerald-900 text-white font-medium rounded-lg hover:bg-emerald-950 transition-colors text-sm"
        >
          ຄົ້ນຫາ
        </button>
        </div>
      </section>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີຂໍ້ມູນຜູ້ສະໜອງ</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full rounded-2xl">
              <thead>
                <tr className="bg-emerald-900 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    #
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ຊື່ຜູ້ສະໜອງ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ເບີໂທ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ອີເມວ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ທີ່ຢູ່
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ວັນທີ່
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ສ້າງໂດຍ
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.createdAt ? new Date(Number(supplier.createdAt)).toLocaleDateString("lo-LA") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.creator ? `${supplier.creator.firstName} ${supplier.creator.lastName}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EditIcon size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <TrashIcon size={18} />
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

      {/* Create Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {editingSupplier ? "ແກ້ໄຂຜູ້ສະໜອງ" : "ເພີ່ມຜູ້ສະໜອງໃໝ່"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ຜູ້ສະໜອງ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ປ້ອນຊື່ຜູ້ສະໜອງ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ເບີໂທ
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="ປ້ອນເບີໂທ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ອີເມວ
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ປ້ອນອີເມວ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

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
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={editingSupplier ? handleUpdate : handleCreate}
                disabled={(submitting || updating) || !formData.name || !formData.phoneNumber}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(submitting || updating) ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Toast */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <WarningIcon size={28} className="text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">ຢືນຢັນການລົບ</h3>
            <p className="text-sm text-gray-500 mb-6">
              ທ່ານຕ້ອງການລົບຜູ້ສະໜອງ &quot;{deleteConfirm.name}&quot; ບໍ?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "ກຳລັງລົບ..." : "ລົບ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
