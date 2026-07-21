"use client";

import React, { useState, useEffect } from 'react';
import {
  CancelIcon,
  UploadIcon,
  SaveIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@/src/components/icons/page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/src/components/toast';
import { useCreateProduct, useCategories, useProduct, useUpdateProduct } from '@/src/features/stock/useProduct';
import { useUnitList, useCreateUnit } from '@/src/features/unit/useUnit';
import type { Unit } from '@/src/features/unit/useUnit';
import { useCreateCategory } from '@/src/features/category/useCategory';
import { Category } from "../types/auth";

interface PlantFormProps {
  productId?: string | null;
}

export default function PlantForm({ productId }: PlantFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = !!productId;
  const { formData, setFormData, submitting, createProduct, resetForm } = useCreateProduct();
  const { submitting: updating, updateProduct } = useUpdateProduct();
  const { product: existingProduct, loading: productLoading } = useProduct(productId || null);
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { units, loading: unitsLoading, error: unitsError, refetch: refetchUnits } = useUnitList();
  const { createCategory, submitting: creatingCategory } = useCreateCategory();
  const { createUnit, submitting: creatingUnit } = useCreateUnit();

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData({
        name: existingProduct.name || "",
        categoryId: existingProduct.categoryId || "",
        imageUrl: existingProduct.imageUrl || "",
        description: existingProduct.description || "",
        size: existingProduct.size || "",
        unit: existingProduct.unit?.id || "",
        weightPerUnit: existingProduct.weightPerUnit ? Number(existingProduct.weightPerUnit) / 1000 : 0,
        ageMonths: existingProduct.ageMonths || 0,
        stockQuantity: existingProduct.stockQuantity || 0,
        costPrice: existingProduct.costPrice || 0,
        salePrice: existingProduct.salePrice || 0,
        pricePerHalfBag: existingProduct.pricePerHalfBag ? Number(existingProduct.pricePerHalfBag) : 0,
        pricePer12Kg: existingProduct.pricePer12Kg ? Number(existingProduct.pricePer12Kg) : 0,
        pricePerKg: existingProduct.pricePerKg ? Number(existingProduct.pricePerKg) : 0,
        discount: existingProduct.discount || 0,
        isSpecialOffer: existingProduct.isSpecialOffer || false,
        isActive: existingProduct.isActive ?? true,
        isFavorite: false,
        isPopular: existingProduct.isPopular || false,
        imageFile: null,
      });
      if (existingProduct.imageUrl) {
        setImagePreview(existingProduct.imageUrl);
      }
    }
  }, [isEditMode, existingProduct]);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const sizeDropdownRef = React.useRef<HTMLDivElement>(null);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const unitDropdownRef = React.useRef<HTMLDivElement>(null);

  // Inline "add category" state
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Sizes are free-text on the product; keep a local list the user can extend inline
  const [sizeOptions, setSizeOptions] = useState<string[]>(['Small', 'Medium', 'Large']);
  const [addingSize, setAddingSize] = useState(false);
  const [newSizeName, setNewSizeName] = useState('');

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const result = await createCategory(name);
    if (result.success) {
      showToast(result.message, 'success');
      await refetchCategories();
      setNewCategoryName('');
      setAddingCategory(false);
    } else {
      showToast(result.message, 'error');
    }
  };

  // Inline "add unit" state
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  const handleAddUnit = async () => {
    const name = newUnitName.trim();
    if (!name) return;
    const result = await createUnit(name);
    if (result.success) {
      showToast(result.message, 'success');
      await refetchUnits();
      setNewUnitName('');
      setAddingUnit(false);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleAddSize = () => {
    const name = newSizeName.trim();
    if (!name) return;
    if (!sizeOptions.includes(name)) {
      setSizeOptions(prev => [...prev, name]);
    }
    setFormData(prev => ({ ...prev, size: name }));
    setNewSizeName('');
    setAddingSize(false);
    setSizeDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setSizeDropdownOpen(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
        setUnitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const numberFields = ['ageMonths', 'weightPerUnit', 'stockQuantity', 'costPrice', 'salePrice', 'pricePerHalfBag', 'pricePer12Kg', 'pricePerKg', 'discount'];

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

    if (isEditMode && productId) {
      const input: Record<string, unknown> = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        size: formData.size,
        unitId: formData.unit || undefined,
        weightPerUnit: (Number(formData.weightPerUnit) || 0) * 1000 || undefined,
        ageMonths: Number(formData.ageMonths) || 0,
        stockQuantity: Number(formData.stockQuantity) || 0,
        stockWeight: (Number(formData.weightPerUnit) || 0) * 1000 * (Number(formData.stockQuantity) || 0),
        costPrice: Number(formData.costPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        pricePerHalfBag: Number(formData.pricePerHalfBag) || undefined,
        pricePer12Kg: Number(formData.pricePer12Kg) || undefined,
        pricePerKg: Number(formData.pricePerKg) || undefined,
        discount: Number(formData.discount) || 0,
        isSpecialOffer: formData.isSpecialOffer,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
      };
      const result = await updateProduct(productId, input);
      if (result.success) {
        showToast(result.message, 'success');
        router.push('/dashboard/stock');
      } else {
        showToast(result.message, 'error');
      }
    } else {
      const result = await createProduct();
      if (result.success) {
        showToast(result.message, 'success');
        setImagePreview(null);
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      router.push('/dashboard/stock');
    } else {
      resetForm();
      setImagePreview(null);
    }
  };

  return (
    <div className="w-full">
      {/* Form Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <form onSubmit={handleSubmit}>
          {/* Product Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b-2 border-dashed border-gray-300">
              ຂໍ້ມູນສີນຄ້າ
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
                  ຊື່ສີນຄ້າ
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ປ້ອນຊື່ສີນຄ້າ"
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
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                        <ul className="max-h-60 overflow-auto">
                          <li
                            onClick={() => {
                              setFormData(prev => ({ ...prev, categoryId: '' }));
                              setCategoryDropdownOpen(false);
                            }}
                            className="px-4 py-3 text-gray-500 hover:bg-green-50 cursor-pointer rounded-t-xl"
                          >
                            ເລືອກໝວດໝູ່
                          </li>
                          {categories.length === 0 && (
                            <li className="px-4 py-3 text-gray-400 text-sm">
                              ຍັງບໍ່ມີໝວດໝູ່
                            </li>
                          )}
                          {categories.map((category: Category) => (
                            <li
                              key={category.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, categoryId: category.id }));
                                setCategoryDropdownOpen(false);
                              }}
                              className={`px-4 py-3 hover:bg-green-50 cursor-pointer ${
                                formData.categoryId === category.id ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {category.name}
                            </li>
                          ))}
                        </ul>

                        {/* Add-new-category footer */}
                        <div className="border-t border-gray-200 bg-gray-50 p-2">
                          {addingCategory ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCategory();
                                  } else if (e.key === 'Escape') {
                                    setAddingCategory(false);
                                    setNewCategoryName('');
                                  }
                                }}
                                placeholder="ຊື່ໝວດໝູ່ໃໝ່"
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={creatingCategory || !newCategoryName.trim()}
                                className="px-3 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {creatingCategory ? '...' : 'ບັນທຶກ'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingCategory(false);
                                  setNewCategoryName('');
                                }}
                                className="px-2 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-200"
                              >
                                ຍົກເລີກ
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddingCategory(true)}
                              className="w-full flex items-center justify-center gap-1 px-4 py-2 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100"
                            >
                              + ເພີ່ມໝວດໝູ່
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຄຳອະທິບາຍ
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-none"
                  placeholder="ປ້ອນຄຳອະທີບາຍສີນຄ້າ"
                />
              </div>

              {/* Size */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຂະໜາດ
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
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                      <ul className="max-h-60 overflow-auto">
                        {sizeOptions.map((size) => (
                          <li
                            key={size}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, size }));
                              setSizeDropdownOpen(false);
                            }}
                            className={`px-4 py-3 hover:bg-green-50 cursor-pointer first:rounded-t-xl ${
                              formData.size === size ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {size}
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-gray-200 bg-gray-50 p-2">
                        {addingSize ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              value={newSizeName}
                              onChange={(e) => setNewSizeName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddSize();
                                } else if (e.key === 'Escape') {
                                  setAddingSize(false);
                                  setNewSizeName('');
                                }
                              }}
                              placeholder="ຂະໜາດໃໝ່"
                              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                            />
                            <button
                              type="button"
                              onClick={handleAddSize}
                              disabled={!newSizeName.trim()}
                              className="px-3 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              ບັນທຶກ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingSize(false);
                                setNewSizeName('');
                              }}
                              className="px-2 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-200"
                            >
                              ຍົກເລີກ
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingSize(true)}
                            className="w-full flex items-center justify-center gap-1 px-4 py-2 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100"
                          >
                            + ເພີ່ມຂະໜາດ
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Unit */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຫົວໜ່ວຍ
                </label>
                {unitsLoading ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                    Loading units...
                  </div>
                ) : unitsError ? (
                  <div className="w-full px-4 py-3 border border-red-300 rounded-xl bg-red-50 text-red-500">
                    Error loading units
                  </div>
                ) : (
                  <div className="relative" ref={unitDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white flex items-center justify-between text-left"
                    >
                      <span className={formData.unit ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.unit
                          ? units.find((u: Unit) => u.id === formData.unit)?.name
                          : 'ເລືອກຫົວໜ່ວຍ'}
                      </span>
                      {unitDropdownOpen ? (
                        <ArrowUpIcon size={20} className="text-gray-500" />
                      ) : (
                        <ArrowDownIcon size={20} className="text-gray-500" />
                      )}
                    </button>
                    {unitDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                        <ul className="max-h-60 overflow-auto">
                          <li
                            onClick={() => {
                              setFormData(prev => ({ ...prev, unit: '' }));
                              setUnitDropdownOpen(false);
                            }}
                            className="px-4 py-3 text-gray-500 hover:bg-green-50 cursor-pointer rounded-t-xl"
                          >
                            ເລືອກຫົວໜ່ວຍ
                          </li>
                          {units.length === 0 && (
                            <li className="px-4 py-3 text-gray-400 text-sm">
                              ຍັງບໍ່ມີຫົວໜ່ວຍ
                            </li>
                          )}
                          {units.map((unit: Unit) => (
                            <li
                              key={unit.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, unit: unit.id }));
                                setUnitDropdownOpen(false);
                              }}
                              className={`px-4 py-3 hover:bg-green-50 cursor-pointer ${
                                formData.unit === unit.id ? 'bg-green-100 text-green-800 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {unit.name}
                            </li>
                          ))}
                        </ul>

                        <div className="border-t border-gray-200 bg-gray-50 p-2">
                          {addingUnit ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={newUnitName}
                                onChange={(e) => setNewUnitName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddUnit();
                                  } else if (e.key === 'Escape') {
                                    setAddingUnit(false);
                                    setNewUnitName('');
                                  }
                                }}
                                placeholder="ຊື່ຫົວໜ່ວຍໃໝ່"
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleAddUnit}
                                disabled={creatingUnit || !newUnitName.trim()}
                                className="px-3 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {creatingUnit ? '...' : 'ບັນທຶກ'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingUnit(false);
                                  setNewUnitName('');
                                }}
                                className="px-2 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-200"
                              >
                                ຍົກເລີກ
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddingUnit(true)}
                              className="w-full flex items-center justify-center gap-1 px-4 py-2 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100"
                            >
                              + ເພີ່ມຫົວໜ່ວຍ
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div> */}

              {/* Weight Per Unit (grams) */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ນ້ຳໜັກຕໍ່ຫົວໜ່ວຍ (ກິໂລ)
                </label>
                <input
                  type="text"
                  name="weightPerUnit"
                  value={formatNumber(formData.weightPerUnit)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ນ້ຳໜັກຕໍ່ຫົວໜ່ວຍ (ກິໂລ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ອາຍຸ (ເດືອນ)
                </label>
                <input
                  type="text"
                  name="ageMonths"
                  value={formatNumber(formData.ageMonths)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ໃສ່ອາຍຸເປັນເດືອນ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ຈຳນວນສິນຄ້າ
                </label>
                <input
                  type="text"
                  name="stockQuantity"
                  value={formatNumber(formData.stockQuantity)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ຈຳນວນ (ຖົງ, ຕົ້ນ, ...)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາຊື້
                </label>
                <input
                  type="text"
                  name="costPrice"
                  value={formatNumber(formData.costPrice)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ລາຄາຊື້ເຂົ້າ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາຂາຍ
                </label>
                <input
                  type="text"
                  name="salePrice"
                  value={formatNumber(formData.salePrice)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ລາຄາຂາຍຕໍ່ຫົວໜ່ວຍ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາເຄິ່ງຖົງ
                </label>
                <input
                  type="text"
                  name="pricePerHalfBag"
                  value={formatNumber(formData.pricePerHalfBag)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ຖ້າບໍ່ໃສ່ = ລາຄາຖົງ / 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາ 12 ກິໂລ
                </label>
                <input
                  type="text"
                  name="pricePer12Kg"
                  value={formatNumber(formData.pricePer12Kg)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ລາຄາຂາຍ 12 ກິໂລ (ຖ້າມີ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ລາຄາຕໍ່ກິໂລ
                </label>
                <input
                  type="text"
                  name="pricePerKg"
                  value={formatNumber(formData.pricePerKg)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  placeholder="ລາຄາຂາຍຕໍ່ກິໂລ (ຖ້າມີ)"
                />
              </div> */}

              {/* Discount */}
              {/* <div>
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
              </div> */}

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
                  ພິເສດ
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
                  ຍອດນິຍົມ
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
              disabled={submitting || updating}
              className="flex items-center gap-2 px-8 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon size={18} />
              {(submitting || updating) ? 'ກຳລັງບັນທຶກ...' : isEditMode ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກພືດ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
