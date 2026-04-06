"use client";

import React, { useState, useEffect } from 'react';
import {
  CancelIcon,
  UploadIcon,
  SaveIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@/src/components/icons/page';
import { useToast } from '@/src/components/toast';
import { useCreateProduct, useCategories } from '@/src/features/stock/useProduct';
import { Category } from "../types/auth";

export default function AddNewPlantForm() {
  const { showToast } = useToast();
  const { formData, setFormData, submitting, createProduct, resetForm } = useCreateProduct();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const sizeDropdownRef = React.useRef<HTMLDivElement>(null);
  const sizeOptions = ['Small', 'Medium', 'Large'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const numberFields = ['ageMonths', 'stockQuantity', 'costPrice', 'salePrice', 'discount'];

  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('en-US');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (numberFields.includes(name)) {
      const raw = value.replace(/,/g, '');
      if (raw === '' || raw === '.') {
        setFormData(prev => ({ ...prev, [name]: 0 }));
      } else if (!isNaN(Number(raw))) {
        setFormData(prev => ({ ...prev, [name]: Number(raw) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createProduct();
    if (result.success) {
      showToast(result.message, 'success');
      setImagePreview(null);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleCancel = () => {
    resetForm();
    setImagePreview(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800">
          ເພີ່ມຕົ້ນໄມ້ໃໝ່
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Product Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-dashed border-gray-300">
              ຂໍ້ມູນພືດ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຮູບພາບຕົ້ນໄມ້ PNG, JPG ສູງສຸດ 10MB
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-green-700 rounded-full flex items-center justify-center">
                        <UploadIcon size={24} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.imageFile ? formData.imageFile.name : 'Click to upload product photo'}
                      </p>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto mt-2 rounded-xl max-h-24 object-contain border border-gray-200 shadow"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຊື່ພືດ
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ໝວດໝູ່
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                    Loading categories...
                  </div>
                ) : categoriesError ? (
                  <div className="w-full px-4 py-3 border border-red-300 rounded-xl bg-red-50 text-red-500">
                    Error loading categories
                  </div>
                ) : (
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white flex items-center justify-between text-left"
                    >
                      <span className={formData.categoryId ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.categoryId
                          ? categories.find(c => c.id === formData.categoryId)?.name
                          : 'ເລືອກໝວດໝູ່'}
                      </span>
                      {categoryDropdownOpen ? (
                        <ArrowUpIcon size={20} className="text-gray-500" />
                      ) : (
                        <ArrowDownIcon size={20} className="text-gray-500" />
                      )}
                    </button>
                    {categoryDropdownOpen && (
                      <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                        <li
                          onClick={() => {
                            setFormData(prev => ({ ...prev, categoryId: '' }));
                            setCategoryDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-gray-500 hover:bg-green-50 cursor-pointer rounded-t-xl"
                        >
                          ເລືອກໝວດໝູ່
                        </li>
                        {categories.map((category: Category) => (
                          <li
                            key={category.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, categoryId: category.id }));
                              setCategoryDropdownOpen(false);
                            }}
                            className={`px-4 py-3 hover:bg-green-50 cursor-pointer last:rounded-b-xl ${
                              formData.categoryId === category.id ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {category.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="relative" ref={sizeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white flex items-center justify-between text-left"
                  >
                    <span className={formData.size ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.size || 'ເລືອກຂະໜາດ'}
                    </span>
                    {sizeDropdownOpen ? (
                      <ArrowUpIcon size={20} className="text-gray-500" />
                    ) : (
                      <ArrowDownIcon size={20} className="text-gray-500" />
                    )}
                  </button>
                  {sizeDropdownOpen && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {sizeOptions.map((size) => (
                        <li
                          key={size}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, size }));
                            setSizeDropdownOpen(false);
                          }}
                          className={`px-4 py-3 hover:bg-green-50 cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                            formData.size === size ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {size}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Age (Months) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Months)
                </label>
                <input
                  type="text"
                  name="ageMonths"
                  value={formatNumber(formData.ageMonths)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter age in months"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="text"
                  name="stockQuantity"
                  value={formatNumber(formData.stockQuantity)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter stock quantity"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="text"
                  name="costPrice"
                  value={formatNumber(formData.costPrice)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter cost price"
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price
                </label>
                <input
                  type="text"
                  name="salePrice"
                  value={formatNumber(formData.salePrice)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter sale price"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="text"
                  name="discount"
                  value={formatNumber(formData.discount)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="Enter discount percentage"
                />
              </div>

              {/* Special Offers */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <input
                    type="checkbox"
                    name="isSpecialOffer"
                    checked={formData.isSpecialOffer}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  Special Offer
                </label>
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  Active
                </label>
              </div>

              {/* Popular */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  Popular
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-red-500 hover:text-white transition-colors"
            >
              <CancelIcon size={18} />
              ຍົກເລີກ
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon size={18} />
              {submitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກພືດ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
