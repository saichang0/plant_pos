"use client";
import { useState, useRef, useMemo } from "react";
import {
  FaSearch,
  FaPrint,
  FaFileInvoice,
  FaSave,
  FaTimes,
  FaTh,
  FaList,
  FaTrash,
} from "react-icons/fa";
import { useProducts, useCategories, type Product } from "@/src/features/stock/useProduct";
import { useCreateSale, type CartItem } from "@/src/features/sale/useSale";
import { useCart } from "@/src/features/sale/useCart";
import { useCurrentUser } from "@/src/features/user/useUser";
import { useToast } from "@/src/components/toast";

export default function SalesPage() {
  // ─── Data hooks ────────────────────────────────────────────
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { submitting, createSale } = useCreateSale();
  const { user: currentUser } = useCurrentUser();
  const toast = useToast();
  // Cart functions for current bill - will be defined after cart variable
  const updateCurrentBill = (updates: Partial<{ cart: CartItem[]; customerName: string; saleNote: string }>) => {
    setBills(prev => prev.map(bill =>
      bill.id === activeBill ? { ...bill, ...updates } : bill
    ));
  };

  // ─── State ─────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  // Sell modal (unit switching + cash calculation)
  const [showSellModal, setShowSellModal] = useState<{ product: Product } | null>(null);
  const [sellInput, setSellInput] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [sellMode, setSellMode] = useState<"amount" | "cash">("amount");

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInput, setPaymentInput] = useState("0");
  const [paymentTab, setPaymentTab] = useState<"cash" | "qr">("cash");

  // Bill tabs with individual cart data
  const [bills, setBills] = useState<{ id: number; name: string; cart: CartItem[]; customerName: string; saleNote: string }[]>([
    { id: 1, name: "Bill 1", cart: [], customerName: "", saleNote: "" }
  ]);
  const [activeBill, setActiveBill] = useState(1);

  // Get current bill's data
  const currentBill = bills.find(b => b.id === activeBill) || bills[0];
  const cart = currentBill?.cart || [];
  const customerName = currentBill?.customerName || "";
  const saleNote = currentBill?.saleNote || "";

  // Calculate totals for current bill
  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subTotal;

  // Cart functions for current bill (defined after cart variable)
  const addToCart = (product: Product, opts?: {
    unitName: string;
    unitId?: string;
    quantity: number;
    weightGrams: number;
    unitPrice: number;
    totalPrice: number;
  }) => {
    if (opts) {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl || null,
        unit: opts.unitName,
        categoryName: product.category?.name || "other",
        quantity: opts.quantity,
        weightGrams: opts.weightGrams,
        unitPrice: opts.unitPrice,
        totalPrice: opts.totalPrice,
        salePrice: product.salePrice,
        pricePerKg: product.pricePerKg ? Number(product.pricePerKg) : undefined,
      };
      updateCurrentBill({ cart: [...cart, newItem] });
      return;
    }
    // Simple piece-based add (no modal needed)
    const unitName = product.unit?.name || "piece";
    const effectivePrice = product.discount && product.discount > 0
      ? product.salePrice - (product.salePrice * product.discount / 100)
      : product.salePrice;
    const newItem: CartItem = {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl || null,
      unit: unitName,
      categoryName: product.category?.name || "other",
      quantity: 1,
      weightGrams: 0,
      unitPrice: effectivePrice,
      totalPrice: effectivePrice,
      salePrice: product.salePrice,
      pricePerKg: product.pricePerKg ? Number(product.pricePerKg) : undefined,
    };
    updateCurrentBill({ cart: [...cart, newItem] });
  };

  const updateCartQty = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (item.weightGrams === 0) {
      item.quantity = Math.max(1, item.quantity + delta);
      item.totalPrice = item.quantity * item.unitPrice;
    }
    updateCurrentBill({ cart: newCart });
  };

  const removeCartItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCurrentBill({ cart: newCart });
  };

  const clearCurrentCart = () => {
    updateCurrentBill({ cart: [], customerName: "", saleNote: "" });
  };

  const setCustomerName = (name: string) => {
    updateCurrentBill({ customerName: name });
  };

  const setSaleNote = (note: string) => {
    updateCurrentBill({ saleNote: note });
  };

  const clearCart = clearCurrentCart; // For compatibility with existing code

  const categoriesRef = useRef<HTMLDivElement>(null);

  // ─── Filtered products ─────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.categoryId !== activeCategory) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // ─── Helpers ────────────────────────────────────────────────
  const isWeightUnit = (name: string | undefined | null) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return lower === "kg" || lower === "gram" || lower === "ກິໂລ" || lower === "ກຣາມ";
  };

  const getAvailableUnits = (product: Product): string[] => {
    const units: string[] = [];
    const unitName = product.unit?.name;
    if (unitName) units.push(unitName);
    // If product has weight per unit (e.g. bag=50kg), allow half-bag + kg/gram
    if (product.weightPerUnit && Number(product.weightPerUnit) > 0 && !isWeightUnit(unitName)) {
      units.push("ເຄິ່ງຖົງ", "12kg", "kg");
    }
    // If default is kg, also allow gram and vice versa
    if (unitName?.toLowerCase() === "gram" && !units.includes("kg")) units.push("kg");
    if (units.length === 0) units.push("piece");
    return units;
  };

  const getPricePerKg = (product: Product): number => {
    if (product.pricePerKg && Number(product.pricePerKg) > 0) return Number(product.pricePerKg);
    if (product.weightPerUnit && Number(product.weightPerUnit) > 0) {
      return Number(product.salePrice) / (Number(product.weightPerUnit) / 1000);
    }
    return Number(product.salePrice);
  };

  const calculateSell = (product: Product, unitName: string, amount: number) => {
    const lower = unitName.toLowerCase();
    const pricePerKg = getPricePerKg(product);

    if (lower === "kg") {
      return { unitPrice: pricePerKg, totalPrice: Math.round(amount * pricePerKg), weightGrams: amount * 1000, quantity: 1 };
    }
    if (lower === "gram") {
      const pricePerGram = pricePerKg / 1000;
      return { unitPrice: pricePerKg, totalPrice: Math.round(amount * pricePerGram), weightGrams: amount, quantity: 1 };
    }
    if (unitName === "ເຄິ່ງຖົງ") {
      const halfBagPrice = product.pricePerHalfBag && Number(product.pricePerHalfBag) > 0
        ? Number(product.pricePerHalfBag)
        : product.salePrice / 2;
      const halfWeight = product.weightPerUnit ? Number(product.weightPerUnit) / 2 : 0;
      return {
        unitPrice: halfBagPrice,
        totalPrice: Math.round(amount * halfBagPrice),
        weightGrams: amount * halfWeight,
        quantity: amount,
      };
    }
    if (unitName === "12kg") {
      const price12Kg = product.pricePer12Kg && Number(product.pricePer12Kg) > 0
        ? Number(product.pricePer12Kg)
        : pricePerKg * 12;
      return {
        unitPrice: price12Kg,
        totalPrice: Math.round(amount * price12Kg),
        weightGrams: amount * 12000,
        quantity: amount,
      };
    }
    // Bag/piece
    const effectivePrice = product.discount && product.discount > 0
      ? product.salePrice - (product.salePrice * product.discount / 100)
      : product.salePrice;
    return {
      unitPrice: effectivePrice,
      totalPrice: Math.round(amount * effectivePrice),
      weightGrams: product.weightPerUnit ? amount * Number(product.weightPerUnit) : 0,
      quantity: amount,
    };
  };

  const calculateByCash = (product: Product, unitName: string, cashAmount: number) => {
    const lower = unitName.toLowerCase();
    const pricePerKg = getPricePerKg(product);

    if (lower === "kg") {
      const kg = cashAmount / pricePerKg;
      return { amount: Math.round(kg * 1000) / 1000, display: `${kg.toFixed(3)} kg`, weightGrams: kg * 1000 };
    }
    if (lower === "gram") {
      const grams = cashAmount / (pricePerKg / 1000);
      return { amount: Math.round(grams), display: `${Math.round(grams)} g`, weightGrams: Math.round(grams) };
    }
    if (unitName === "ເຄິ່ງຖົງ") {
      const halfBagPrice = product.pricePerHalfBag && Number(product.pricePerHalfBag) > 0
        ? Number(product.pricePerHalfBag)
        : product.salePrice / 2;
      const count = Math.floor(cashAmount / halfBagPrice);
      const halfWeight = product.weightPerUnit ? Number(product.weightPerUnit) / 2 : 0;
      return { amount: count, display: `${count} ເຄິ່ງຖົງ`, weightGrams: count * halfWeight };
    }
    if (unitName === "12kg") {
      const price12Kg = product.pricePer12Kg && Number(product.pricePer12Kg) > 0
        ? Number(product.pricePer12Kg)
        : pricePerKg * 12;
      const count = Math.floor(cashAmount / price12Kg);
      return { amount: count, display: `${count} x 12kg`, weightGrams: count * 12000 };
    }
    // Bag/piece
    const effectivePrice = product.discount && product.discount > 0
      ? product.salePrice - (product.salePrice * product.discount / 100)
      : product.salePrice;
    const pieces = Math.floor(cashAmount / effectivePrice);
    return { amount: pieces, display: `${pieces} ${unitName}`, weightGrams: product.weightPerUnit ? pieces * Number(product.weightPerUnit) : 0 };
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    const availableUnits = getAvailableUnits(product);
    // If product has multiple unit options or is weight-based, show sell modal
    if (availableUnits.length > 1 || isWeightUnit(product.unit?.name)) {
      setShowSellModal({ product });
      const defaultUnit = product.unit?.name || availableUnits[0];
      setSelectedUnit(defaultUnit);
      setSellInput(!isWeightUnit(defaultUnit) ? "1" : "");
      setSellMode("amount");
      return;
    }
    // Simple piece-based product, add directly
    addToCart(product);
  };

  const handleConfirmSellModal = () => {
    if (!showSellModal || !sellInput) return;
    const product = showSellModal.product;
    const amount = parseFloat(sellInput);
    if (isNaN(amount) || amount <= 0) return;

    if (sellMode === "cash") {
      // Cash mode: calculate weight/quantity from cash amount
      const result = calculateByCash(product, selectedUnit, amount);
      if (result.amount <= 0) return;
      const calc = calculateSell(product, selectedUnit, result.amount);
      addToCart(product, {
        unitName: selectedUnit,
        unitId: product.unit?.id,
        quantity: calc.quantity,
        weightGrams: calc.weightGrams,
        unitPrice: calc.unitPrice,
        totalPrice: Math.round(amount), // totalPrice = the cash amount given
      });
    } else {
      // Amount mode: direct quantity/weight
      const calc = calculateSell(product, selectedUnit, amount);
      addToCart(product, {
        unitName: selectedUnit,
        unitId: product.unit?.id,
        quantity: calc.quantity,
        weightGrams: calc.weightGrams,
        unitPrice: calc.unitPrice,
        totalPrice: calc.totalPrice,
      });
    }
    setShowSellModal(null);
    setSellInput("");
  };

  // ─── Payment modal helpers ──────────────────────────────────
  const paymentAmount = parseInt(paymentInput) || 0;
  const changeAmount = paymentAmount - total;

  const handleNumpadPress = (key: string) => {
    if (key === "C") {
      setPaymentInput("0");
    } else if (key === "⌫") {
      setPaymentInput((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
    } else {
      setPaymentInput((prev) => (prev === "0" ? key : prev + key));
    }
  };

  const handleQuickAmount = (amount: number) => {
    setPaymentInput((prev) => {
      const current = parseInt(prev) || 0;
      return String(current + amount);
    });
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      toast.showToast("ກະລຸນາເລືອກສິນຄ້າກ່ອນ", "error");
      return;
    }
    setPaymentInput("0");
    setPaymentTab("cash");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (paymentTab === "cash" && changeAmount < 0) {
      toast.showToast("ເງິນບໍ່ພໍ", "error");
      return;
    }
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?.id) {
      toast.showToast("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ", "error");
      return;
    }
    const result = await createSale({
      userId: user.id,
      customerName: customerName || undefined,
      note: saleNote || undefined,
      status: "paid",
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        weightGrams: item.weightGrams || 0,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        note: item.note || undefined,
      })),
      payments: [{
        paymentMethod: paymentTab === "cash" ? "cash" : "qr",
        currency: "KIP",
        amount: total,
      }],
    });
    if (result.success) {
      toast.showToast("ຂາຍສຳເລັດແລ້ວ!", "success");
      setShowPaymentModal(false);

      // Move current bill to completed (remove it, don't create new one)
      const currentBillData = bills.find(b => b.id === activeBill);
      if (currentBillData) {
        // Remove current bill from active bills
        const remainingBills = bills.filter(b => b.id !== activeBill);
        setBills(remainingBills);

        // Only switch to another bill if there are remaining bills
        if (remainingBills.length > 0) {
          setActiveBill(remainingBills[0].id);
        }
        // If no bills left, create a new empty one
        else {
          const newId = 1;
          setBills([{
            id: newId,
            name: `Bill ${newId}`,
            cart: [],
            customerName: "",
            saleNote: ""
          }]);
          setActiveBill(newId);
        }
      }

      refetchProducts();
    } else {
      toast.showToast(result.message || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  };

  const handleExactAmount = () => {
    setPaymentInput(String(total));
  };

  const addNewBill = () => {
    const newId = bills.length > 0 ? Math.max(...bills.map((b) => b.id)) + 1 : 1;
    setBills((prev) => [...prev, {
      id: newId,
      name: `Bill ${newId}`,
      cart: [],
      customerName: "",
      saleNote: ""
    }]);
    setActiveBill(newId);
  };

  const closeBill = (id: number) => {
    if (bills.length <= 1) return;
    setBills((prev) => prev.filter((b) => b.id !== id));
    if (activeBill === id) {
      const remaining = bills.filter((b) => b.id !== id);
      setActiveBill(remaining[0]?.id || 1);
    }
  };

  const scrollCategories = (dir: "left" | "right") => {
    categoriesRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* LEFT PANEL — Product List / Grid */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {viewMode === "list" ? <FaTh className="w-4 h-4" /> : <FaList className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Category Filter ──────────────────────────────────── */}
        <div ref={categoriesRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-4 py-4 rounded-xl border whitespace-nowrap transition-colors shrink-0 ${activeCategory === "all"
              ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            ທັງໝົດ ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl border text-sm whitespace-nowrap transition-colors shrink-0 ${activeCategory === cat.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Product Table (List View) ────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200">
          {productsLoading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">ກຳລັງໂຫຼດ...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">ບໍ່ພົບສິນຄ້າ</div>
          ) : viewMode === "list" ? (
            <table className="w-full text-sm">
              <thead className="bg-emerald-900 text-white sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3 text-left font-medium w-10">#</th>
                  <th className="py-3 px-3 text-left font-medium">ປະເພດ</th>
                  <th className="py-3 px-3 text-left font-medium">ຊື່ສິນຄ້າ</th>
                  <th className="py-3 px-3 text-center font-medium">ສິນຄ້າທີ່ມີຢູ່</th>
                  <th className="py-3 px-3 text-right font-medium">ລາຄາ</th>
                  <th className="py-3 px-3 text-right font-medium">ໜ່ວຍ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product, idx) => {
                  const hasWeight = Number(product.stockWeight) > 0;
                  const hasQty = product.stockQuantity > 0;
                  const hasStock = hasWeight || hasQty;
                  const stockDisplay = hasWeight
                    ? `${product.stockQuantity} (${(Number(product.stockWeight) / 1000).toFixed(1)} kg)`
                    : `${product.stockQuantity}`;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      onClick={() => handleAddToCart(product)}
                    >
                      <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-3 text-center">
                        {product.category ? (
                          <span className="text-sm text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">
                            {product.category.name}
                          </span>
                        ) : (
                          "_"
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {hasStock ? (
                          <span className="text-green-600 font-medium">{stockDisplay}</span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500">
                            <FaTimes className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-800">
                        ₭ {product.salePrice}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500">
                        {product.unit?.name || "_"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Grid View */
            <div className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const hasWeight = Number(product.stockWeight) > 0;
                const hasQty = product.stockQuantity > 0;
                const gridHasStock = hasWeight || hasQty;
                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="relative h-28 bg-gray-50">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                          {product.category?.name || "other"}
                        </div>
                      )}
                      {product.isPopular && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-blue-500">ຂາຍດີ</span>
                      )}
                      {product.isSpecialOffer && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white bg-red-500">ລົດລາຄາ</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-gray-400 mb-0.5">
                        {product.category?.name || "other"}
                      </p>
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-gray-800">₭ {product.salePrice}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${gridHasStock
                          ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                          }`}>
                          {hasWeight
                            ? `${product.stockQuantity} (${(Number(product.stockWeight)).toFixed(1)} kg)`
                            : `${product.stockQuantity} ${product.unit?.name || "piece"}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Bill */}
      <div className="w-full md:w-[480px] sm:w-[320px] shrink-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
        {/* Bill Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 px-3 pt-2">
          <div className="flex items-center gap-1">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm cursor-pointer transition-colors ${activeBill === bill.id
                  ? "bg-white border border-gray-200 border-b-white font-semibold text-gray-800 -mb-px"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
                onClick={() => setActiveBill(bill.id)}
              >
                {bill.name}
                {bills.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); closeBill(bill.id); }}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNewBill}
              className="px-3 py-2 text-sm text-gray-400 hover:text-blue-600 transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Bill Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-[minmax(0,1.5fr)_80px_60px_80px_60px_60px_30px] gap-1 px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">
            <span>ຊື່ສິນຄ້າ</span>
            <span className="text-center">ຈຳນວນ</span>
            <span className="text-center">ໜ່ວຍ</span>
            <span className="text-right">ລາຄາ</span>
            <span className="text-right">ລວມ</span>
            <span></span>
          </div>
        </div>

        {/* Bill Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
              <p className="text-sm">ຍັງບໍ່ມີລາຍການ</p>
              <p className="text-xs mt-1">ກົດເລືອກສິນຄ້າດ້ານຊ້າຍ</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="grid grid-cols-[minmax(0,1.5fr)_80px_60px_80px_60px_60px_30px] gap-1 items-center px-3 py-2.5 hover:bg-blue-50/30 transition-colors"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {idx + 1}. {item.name}
                    </p>
                    {item.weightGrams > 0 && (
                      <p className="text-[10px] text-blue-500">
                        {item.weightGrams >= 1000 ? `${(item.weightGrams / 1000).toFixed(1)} kg` : `${item.weightGrams} g`}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-center">
                    {item.weightGrams === 0 ? (
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCartQty(idx, -1)}
                          className="text-gray-400 hover:text-gray-600 px-1"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-semibold border border-gray-200 rounded py-0.5 mx-0.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(idx, 1)}
                          className="text-green-600 hover:text-green-700 px-1"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">1</span>
                    )}
                  </div>

                  {/* Unit selector */}
                  <div className="text-center">
                    <span className="px-2 py-1 border border-green-400 text-green-700 rounded text-xs bg-green-50">
                      {(item.unit)}
                    </span>
                  </div>

                  {/* Unit Price */}
                  <span className="text-xs text-right text-gray-700 font-medium">
                    {(item.unitPrice)} ₭
                  </span>

                  {/* Total */}
                  <span className="text-xs text-right font-semibold text-gray-800">
                    {(item.totalPrice)} ₭
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => removeCartItem(idx)}
                    className="text-red-400 hover:text-red-600 flex items-center justify-center"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        {cart.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-100">
            <input
              type="text"
              placeholder="ໝາຍເຫດ..."
              value={saleNote}
              onChange={(e) => setSaleNote(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
        )}

        {/* Summary */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>ລວມ ({cart.length} ລາຍການ)</span>
            <span className="font-semibold text-gray-700">{(subTotal)} ₭</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="text-base font-bold text-gray-900">ຕ້ອງຈ່າຍ</span>
            <span className="text-base font-bold text-blue-600">{(total)} ₭</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 pt-2 space-y-2">
          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0 || submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນການຂາຍ"}
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl w-[440px] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[#1e293b] text-white px-5 py-4 flex items-center justify-between">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-1.5 border border-white/30 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                ⇄ ບໍ່ລິການອື່ນໆ
              </button>
              <div className="text-right">
                <span className="text-lg font-bold">
                  {changeAmount >= 0 ? "ເງິນທອນ" : "ເງິນບໍ່ພໍ"}: {(changeAmount)} ₭
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setPaymentTab("cash")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${paymentTab === "cash"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="text-base">💵</span> ເງິນສົດ
              </button>
              <button
                onClick={() => setPaymentTab("qr")}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${paymentTab === "qr"
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <span className="text-base">📱</span> ຊຳລະດ້ວຍ QR
              </button>
            </div>

            {paymentTab === "cash" ? (
              <>
                {/* Cash input display */}
                <div className="px-5 py-4">
                  <div className="border-2 border-blue-200 rounded-xl px-4 py-3 flex items-center justify-end bg-blue-50/30">
                    <span className="text-3xl font-bold text-gray-800">
                      {(paymentAmount)}
                    </span>
                  </div>
                </div>

                {/* Numpad */}
                <div className="px-5 pb-3 grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleNumpadPress(key)}
                      className={`py-4 rounded-xl text-lg font-semibold transition-colors ${key === "C"
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : key === "⌫"
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                      {key}
                    </button>
                  ))}
                  {/* Quick amounts */}
                  <button
                    onClick={() => handleQuickAmount(100000)}
                    className="py-4 rounded-xl text-sm font-semibold bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200 row-start-1 col-start-4"
                  >
                    100,000
                  </button>
                  <button
                    onClick={() => handleQuickAmount(50000)}
                    className="py-4 rounded-xl text-sm font-semibold bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200 row-start-2 col-start-4"
                  >
                    50,000
                  </button>
                  {/* No receipt */}
                  <button
                    onClick={handleConfirmPayment}
                    disabled={changeAmount < 0 || submitting}
                    className="py-4 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed row-start-3 col-start-4 flex items-center justify-center gap-1"
                  >
                    ຢືນຢັນການຊຳລະ
                  </button>
                </div>

                {/* Bottom actions */}
                <div className="px-5 pb-4 grid grid-cols-5 gap-2">
                  <button
                    onClick={handleExactAmount}
                    className="py-3 rounded-xl text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    ເງິນພໍດີ
                  </button>
                  <button
                    onClick={() => {
                      // Convert to KIP (assuming 1 THB = 600 LAK)
                      const kipAmount = Math.round(total * 600);
                      setPaymentInput(String(kipAmount));
                    }}
                    className="py-3 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  >
                    ₭ KIP
                  </button>
                  <button
                    onClick={() => {
                      // Convert to Baht (assuming 1 KIP = 0.0017 THB)
                      const bahtAmount = Math.round(total / 600);
                      setPaymentInput(String(bahtAmount));
                    }}
                    className="py-3 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                  >
                    ฿ BAHT
                  </button>
                  <button
                    onClick={() => {
                      // Convert to USD (assuming 1 THB = 0.028 USD)
                      const usdAmount = Math.round(total / 36000);
                      setPaymentInput(String(usdAmount));
                    }}
                    className="py-3 rounded-xl text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                  >
                    $ DOLLAR
                  </button>
                </div>
              </>
            ) : (
              /* QR Tab */
              <div className="px-5 py-8 text-center">
                {currentUser?.bankAccountImageUrl ? (
                  <img
                    src={currentUser.bankAccountImageUrl}
                    alt="QR"
                    className="mx-auto mb-4 max-h-64 object-contain rounded-xl border border-gray-200"
                  />
                ) : (
                  <>
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-xs text-gray-400 mb-2">
                      ກະລຸນາຕັ້ງຄ່າ QR ບັນຊີທະນາຄານໃນຕັ້ງຄ່າຮ້ານ
                    </p>
                  </>
                )}
                <p className="text-gray-500 text-sm mb-2">ສະແກນ QR Code ເພື່ອຊຳລະ</p>
                <p className="text-2xl font-bold text-gray-800 mb-6">
                  {(total).toLocaleString()} ₭
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {submitting ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນການຊຳລະ"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELL MODAL — Unit Switching + Cash Calculation */}
      {showSellModal && (() => {
        const product = showSellModal.product;
        const availableUnits = getAvailableUnits(product);
        const pricePerKg = getPricePerKg(product);
        const inputVal = parseFloat(sellInput) || 0;

        // Preview calculation
        let preview = { totalPrice: 0, display: "" };
        if (inputVal > 0) {
          if (sellMode === "cash") {
            const cashResult = calculateByCash(product, selectedUnit, inputVal);
            preview = { totalPrice: inputVal, display: cashResult.display };
          } else {
            const calc = calculateSell(product, selectedUnit, inputVal);
            preview = { totalPrice: calc.totalPrice, display: `${calc.totalPrice.toLocaleString()} ₭` };
          }
        }

        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                ລາຄາ: {product.salePrice.toLocaleString()} ₭/{product.unit?.name || "piece"}
                {pricePerKg !== product.salePrice && ` | ${pricePerKg.toLocaleString()} ₭/kg`}
              </p>

              {/* Unit selector */}
              <div className="flex gap-2 mb-4">
                {availableUnits.map((u) => (
                  <button
                    key={u}
                    onClick={() => { setSelectedUnit(u); setSellInput(!isWeightUnit(u) ? "1" : ""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedUnit === u ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    {u}
                  </button>
                ))}
              </div>

              {/* Mode toggle: Amount vs Cash */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => { setSellMode("amount"); setSellInput(""); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${sellMode === "amount" ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {isWeightUnit(selectedUnit) ? "ໃສ່ນ້ຳໜັກ" : "ໃສ່ຈຳນວນ"}
                </button>
                <button
                  onClick={() => { setSellMode("cash"); setSellInput(""); setSelectedUnit("kg"); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${sellMode === "cash" ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  💵 ຄິດໄລ່ຈາກເງິນ
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  inputMode={sellMode === "cash" ? "numeric" : "decimal"}
                  placeholder={sellMode === "cash" ? "ໃສ່ຈຳນວນເງິນ (₭)" : isWeightUnit(selectedUnit) ? `ໃສ່ນ້ຳໜັກ (${selectedUnit})` : "ໃສ່ຈຳນວນ"}
                  value={sellMode === "cash" && sellInput ? Number(sellInput).toLocaleString("en-US") : sellInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (raw === "" || raw === ".") { setSellInput(""); return; }
                    if (!isNaN(Number(raw))) setSellInput(raw);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {sellMode === "cash" ? "₭" : selectedUnit}
                </span>
              </div>

              {/* Preview */}
              {inputVal > 0 && (
                <div className={`rounded-xl p-3 mb-4 text-center ${sellMode === "cash" ? "bg-orange-50" : "bg-blue-50"}`}>
                  {sellMode === "cash" ? (
                    <>
                      <p className="text-sm text-gray-500">ລູກຄ້າໄດ້ຮັບ</p>
                      <p className="text-2xl font-bold text-orange-600">{preview.display}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">ລາຄາ</p>
                      <p className="text-2xl font-bold text-blue-600">{preview.display}</p>
                    </>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSellModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  ຍົກເລີກ
                </button>
                <button
                  onClick={handleConfirmSellModal}
                  disabled={inputVal <= 0}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300"
                >
                  ເພີ່ມໃສ່ບິນ
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
