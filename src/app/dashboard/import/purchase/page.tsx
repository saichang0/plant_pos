"use client";
import { useState, useEffect, useRef } from 'react';
import {
  SearchIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@/src/components/icons/page';
import { useProducts, useCategories, Product } from '@/src/features/stock/useProduct';
import { useSuppliers } from '@/src/features/supplier/useSupplier';
import { useCreatePurchaseOrder } from '@/src/features/import/useImport';
import { useToast } from '@/src/components/toast';

export default function PurchasePage() {
  const { products, loading, error, refetch } = useProducts();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  const { submitting, createPurchaseOrder } = useCreatePurchaseOrder();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('ໝວດໝູ່ທັງໝົດ');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState('ສະຖານະທັງໝົດ');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusOptions = ['ສະຖານະທັງໝົດ', 'Active', 'Inactive'];

  // Selected products with quantities
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  // Supplier selection for purchase order
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierRef = useRef<HTMLDivElement>(null);

  // Confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
      if (supplierRef.current && !supplierRef.current.contains(e.target as Node)) setShowSupplierDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US");
  };

  // Filter
  const filtered = products.filter(product => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(q)) return false;
    }
    if (selectedCategory !== 'ໝວດໝູ່ທັງໝົດ') {
      const cat = categories.find((c) => c.name === selectedCategory);
      if (cat && product.categoryId !== cat.id) return false;
    }
    if (selectedStatus === 'Active' && !product.isActive) return false;
    if (selectedStatus === 'Inactive' && product.isActive) return false;
    return true;
  });

  const handleRowClick = (product: Product) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(product.id)) {
        newMap.delete(product.id);
      } else {
        newMap.set(product.id, 1);
      }
      return newMap;
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      newMap.set(productId, quantity);
      return newMap;
    });
  };

  const handleSearch = () => {
    refetch({
      keyword: searchQuery || undefined,
    });
  };

  const selectedSupplierName = suppliers.find(s => s.id === selectedSupplierId)?.name || 'ເລືອກຜູ້ສະໜອງ';

  // Calculate total
  const totalPrice = Array.from(selectedItems.entries()).reduce((sum, [productId, qty]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.costPrice * qty : 0);
  }, 0);

  const handlePurchaseClick = () => {
    if (selectedItems.size === 0) {
      showToast("ກະລຸນາເລືອກສິນຄ້າ", "warning");
      return;
    }
    if (!selectedSupplierId) {
      showToast("ກະລຸນາເລືອກຜູ້ສະໜອງ", "warning");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    const items = Array.from(selectedItems.entries()).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        quantity,
        costPrice: product?.costPrice || 0,
      };
    });

    const result = await createPurchaseOrder(selectedSupplierId, items);
    setShowConfirmModal(false);

    if (result.success) {
      showToast("ສ້າງໃບສັ່ງຊື້ສຳເລັດແລ້ວ", "success");
      setSelectedItems(new Map());
      setSelectedSupplierId('');
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Filters */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedCategory}</span>
              {showCategoryDropdown ? <ArrowUpIcon size={16} className="text-gray-500" /> : <ArrowDownIcon size={16} className="text-gray-500" />}
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setSelectedCategory('ໝວດໝູ່ທັງໝົດ'); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 rounded-t-lg ${selectedCategory === 'ໝວດໝູ່ທັງໝົດ' ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                >
                  ໝວດໝູ່ທັງໝົດ
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 last:rounded-b-lg ${selectedCategory === cat.name ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedStatus}</span>
              {showStatusDropdown ? <ArrowUpIcon size={16} className="text-gray-500" /> : <ArrowDownIcon size={16} className="text-gray-500" />}
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedStatus(s); setShowStatusDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${selectedStatus === s ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Supplier Dropdown */}
          <div className="relative" ref={supplierRef}>
            <button
              onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedSupplierName}</span>
              {showSupplierDropdown ? <ArrowUpIcon size={16} className="text-gray-500" /> : <ArrowDownIcon size={16} className="text-gray-500" />}
            </button>
            {showSupplierDropdown && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suppliers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSupplierId(s.id); setShowSupplierDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${selectedSupplierId === s.id ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase button */}
          <button
            onClick={handlePurchaseClick}
            className={`flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg transition-colors ${
              selectedItems.size > 0 ? 'bg-green-600' : 'bg-slate-600'
            }`}
          >
            <span className="text-sm text-white font-bold">ສັ່ງຊື້({selectedItems.size})</span>
          </button>

          {/* Cancel */}
          <button
            onClick={() => { setSelectedItems(new Map()); setSelectedSupplierId(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 border border-gray-300 rounded-lg transition-colors"
          >
            <span className="text-sm text-white font-bold">ຍົກເລີກ</span>
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-500">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-emerald-900 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຮູບ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຊື່ສິນຄ້າ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ໝວດໝູ່</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຂະໜາດ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຕົ້ນທຶນ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຂາຍ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ຈຳນວນສັ່ງ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((product, index) => {
                  const isSelected = selectedItems.has(product.id);
                  const qty = selectedItems.get(product.id) || 0;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => handleRowClick(product)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-green-100 hover:bg-green-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCategoryName(product.categoryId)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.size || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatPrice(product.costPrice)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{formatPrice(product.salePrice)}</td>
                      <td className="px-6 py-4 text-center">
                        {isSelected ? (
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1.5 text-sm text-center border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">ທັງໝົດ {filtered.length} ສິນຄ້າ</p>
        </div>
      </section>

      {/* Confirm Purchase Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">ຢືນຢັນການສັ່ງຊື້</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">ຜູ້ສະໜອງ</p>
              <p className="text-sm font-medium text-gray-900">{selectedSupplierName}</p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">ສິນຄ້າ</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600">ຈຳນວນ</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">ລາຄາ</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">ລວມ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from(selectedItems.entries()).map(([productId, qty]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    return (
                      <tr key={productId}>
                        <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-center">{qty}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatPrice(product.costPrice)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatPrice(product.costPrice * qty)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mb-6 px-1">
              <span className="text-sm font-semibold text-gray-700">ລວມທັງໝົດ</span>
              <span className="text-lg font-bold text-emerald-900">₭ {formatPrice(totalPrice)}</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-900 rounded-lg hover:bg-emerald-950 transition-colors disabled:opacity-50"
              >
                {submitting ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
