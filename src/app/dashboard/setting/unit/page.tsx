"use client";

import React, { useState } from "react";
import {
  useUnitList,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/src/features/unit/useUnit";
import type { Unit } from "@/src/features/unit/useUnit";
import {
  SearchIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
} from "@/src/components/icons/page";
import { useToast } from "@/src/components/toast";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function UnitPage() {
  const { units, loading, error, refetch } = useUnitList();
  const { submitting: creating, createUnit } = useCreateUnit();
  const { submitting: updating, updateUnit } = useUpdateUnit();
  const { submitting: deleting, deleteUnit } = useDeleteUnit();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formName, setFormName] = useState("");
  const [formWeight, setFormWeight] = useState("");

  // ─── Filter ────────────────────────────────────────────────
  const filteredUnits = units.filter((u) => {
    if (!searchQuery) return true;
    return u.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ─── Handlers ──────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingUnit(null);
    setFormName("");
    setShowModal(true);
  };

  const openEditModal = (u: Unit) => {
    setEditingUnit(u);
    setFormName(u.name);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUnit(null);
    setFormName("");
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showToast("ກະລຸນາໃສ່ຊື່ຫົວໜ່ວຍ", "error");
      return;
    }
    if (editingUnit) {
      const result = await updateUnit(editingUnit.id, formName.trim());
      if (result.success) {
        showToast("ແກ້ໄຂຫົວໜ່ວຍສຳເລັດ", "success");
        closeModal();
        refetch();
      } else {
        showToast(result.message, "error");
      }
    } else {
      const result = await createUnit(formName.trim(), formWeight ? parseFloat(formWeight) : undefined);
      if (result.success) {
        showToast("ເພີ່ມຫົວໜ່ວຍສຳເລັດ", "success");
        closeModal();
        refetch();
      } else {
        showToast(result.message, "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const result = await deleteUnit(deleteConfirm.id);
    if (result.success) {
      showToast("ລຶບຫົວໜ່ວຍສຳເລັດ", "success");
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
          <h1 className="text-2xl font-bold text-gray-900">ຈັດການຫົວໜ່ວຍ</h1>
          <p className="text-sm text-gray-500 mt-1">
            ທັງໝົດ {units.length} ຫົວໜ່ວຍ
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          <FaPlus className="w-3.5 h-3.5" />
          ເພີ່ມຫົວໜ່ວຍ
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ຄົ້ນຫາຫົວໜ່ວຍ..."
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
        ) : filteredUnits.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີຂໍ້ມູນຫົວໜ່ວຍ</div>
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
                    ຊື່ຫົວໜ່ວຍ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ນ້ຳໜັກ (kg)
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ສ້າງໂດຍ
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">
                    ວັນທີສ້າງ
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">
                    ຈັດການ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnits.map((unit, index) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {unit.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800">
                        {unit.weightInGrams ? `${unit.weightInGrams} kg` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {unit.creator
                        ? `${unit.creator.firstName} ${unit.creator.lastName}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(unit.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(unit)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ແກ້ໄຂ"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ id: unit.id, name: unit.name })
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

      {/* Create / Edit Modal */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUnit ? "ແກ້ໄຂຫົວໜ່ວຍ" : "ເພີ່ມຫົວໜ່ວຍໃໝ່"}
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
                  ຊື່ຫົວໜ່ວຍ
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ໃສ່ຊື່ຫົວໜ່ວຍ..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ນ້ຳໜັກ (kg)
                </label>
                <input
                  type="text"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  placeholder="ໃສ່ນ້ຳໜັກ..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
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
                  : editingUnit
                    ? "ບັນທຶກ"
                    : "ເພີ່ມ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}

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
                ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຫົວໜ່ວຍ{" "}
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
