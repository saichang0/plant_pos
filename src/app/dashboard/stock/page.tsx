"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProducts, useCategories } from "@/src/features/stock/useProduct";
import { SearchIcon, RefreshIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon } from "@/src/components/icons/page";

export default function StockPage() {
  const { products, total, loading, error, refetch } = useProducts();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState("ໝວດໝູ່ທັງໝົດ");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Status filter
  const [selectedStatus, setSelectedStatus] = useState("ສະຖານະທັງໝົດ");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusOptions = ["ສະຖານະທັງໝົດ", "Active", "Inactive"];

  // Special offer filter
  const [selectedOffer, setSelectedOffer] = useState("ທັງໝົດ");
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);
  const offerRef = useRef<HTMLDivElement>(null);
  const offerOptions = ["ທັງໝົດ", "Special Offer", "Normal"];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
      if (offerRef.current && !offerRef.current.contains(e.target as Node)) setShowOfferDropdown(false);
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

  // Apply filters
  const handleSearch = () => {
    const filter: { isSpecialOffer?: boolean } = {};
    if (selectedOffer === "Special Offer") filter.isSpecialOffer = true;
    else if (selectedOffer === "Normal") filter.isSpecialOffer = false;

    refetch({
      keyword: searchQuery || undefined,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });
  };

  // Filter products client-side for category and status (backend doesn't support these filters directly)
  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "ໝວດໝູ່ທັງໝົດ") {
      const cat = categories.find((c) => c.name === selectedCategory);
      if (cat && product.categoryId !== cat.id) return false;
    }
    if (selectedStatus === "Active" && !product.isActive) return false;
    if (selectedStatus === "Inactive" && product.isActive) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">ສິນຄ້າທັງໝົດ</h1>
          <p className="text-slate-500 mt-1">
            ທັງໝົດ {filteredProducts.length} ສິນຄ້າ
          </p>
        </div>
      </div>

      {/* Search & Filters */}
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-emerald-900 text-white font-medium rounded-lg hover:bg-emerald-950 transition-colors text-sm"
          >
            ຄົ້ນຫາ
          </button>

          {/* Category Dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedCategory}</span>
              {showCategoryDropdown ? (
                <ArrowUpIcon size={16} className="text-gray-500" />
              ) : (
                <ArrowDownIcon size={16} className="text-gray-500" />
              )}
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setSelectedCategory("ໝວດໝູ່ທັງໝົດ"); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg ${selectedCategory === "ໝວດໝູ່ທັງໝົດ" ? "text-green-700 font-medium bg-green-50" : "text-gray-700"}`}
                >
                  ໝວດໝູ່ທັງໝົດ
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.name); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 last:rounded-b-lg ${selectedCategory === cat.name ? "text-green-700 font-medium bg-green-50" : "text-gray-700"}`}
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
              {showStatusDropdown ? (
                <ArrowUpIcon size={16} className="text-gray-500" />
              ) : (
                <ArrowDownIcon size={16} className="text-gray-500" />
              )}
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => { setSelectedStatus(status); setShowStatusDropdown(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${selectedStatus === status ? "text-green-700 font-medium bg-green-50" : "text-gray-700"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Special Offer Dropdown */}
          <div className="relative" ref={offerRef}>
            <button
              onClick={() => setShowOfferDropdown(!showOfferDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{selectedOffer}</span>
              {showOfferDropdown ? (
                <ArrowUpIcon size={16} className="text-gray-500" />
              ) : (
                <ArrowDownIcon size={16} className="text-gray-500" />
              )}
            </button>
            {showOfferDropdown && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {offerOptions.map((offer) => (
                  <button
                    key={offer}
                    onClick={() => { setSelectedOffer(offer); setShowOfferDropdown(false); handleSearch(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg ${selectedOffer === offer ? "text-green-700 font-medium bg-green-50" : "text-gray-700"}`}
                  >
                    {offer}
                  </button>
                ))}
              </div>
            )}
          </div>
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
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">ບໍ່ມີສິນຄ້າ</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full rounded-2xl">
              <thead>
                <tr className="bg-emerald-900 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">#</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຮູບ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຊື່ສິນຄ້າ</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ໝວດໝູ່</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-100">ຂະໜາດ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຕົ້ນທຶນ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ລາຄາຂາຍ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-100">ຈຳນວນ</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-100">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.size || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {formatPrice(product.costPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      {formatPrice(product.salePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={product.stockQuantity > 0 ? "text-green-700 font-medium" : "text-red-500 font-medium"}>
                        {formatPrice(product.stockQuantity)}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
