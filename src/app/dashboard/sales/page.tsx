"use client";
import { useState, useRef, useMemo } from "react";
import {
  FaSearch,
  FaTimes,
  FaTh,
  FaList,
  FaTrash,
  FaShoppingCart,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import {
  useProducts,
  useCategories,
  type Product,
} from "@/src/features/stock/useProduct";
import { useCreateSale, type CartItem } from "@/src/features/sale/useSale";
import { useCurrentUser } from "@/src/features/user/useUser";
import { useToast } from "@/src/components/toast";

const formatMoney = (n: number | string | undefined) => {
  const num = Number(n) || 0;
  return num.toLocaleString("en-US");
};

export default function SalesPage() {
  // ─── Data hooks ────────────────────────────────────────────
  const { products, loading: productsLoading, refetch: refetchProducts } =
    useProducts();
  const { categories } = useCategories();
  const { submitting, createSale } = useCreateSale();
  const { user: currentUser } = useCurrentUser();
  const toast = useToast();

  // ─── State ─────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSellModal, setShowSellModal] = useState<{ product: Product } | null>(
    null,
  );
  const [sellInput, setSellInput] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [sellMode, setSellMode] = useState<"amount" | "cash">("amount");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInput, setPaymentInput] = useState("0");
  const [paymentTab, setPaymentTab] = useState<"cash" | "qr">("cash");

  // Mobile-only: full-screen cart sheet
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const [bills, setBills] = useState<
    {
      id: number;
      name: string;
      cart: CartItem[];
      customerName: string;
      saleNote: string;
    }[]
  >([{ id: 1, name: "ບິນ 1", cart: [], customerName: "", saleNote: "" }]);
  const [activeBill, setActiveBill] = useState(1);

  const currentBill = bills.find((b) => b.id === activeBill) || bills[0];
  const cart = currentBill?.cart || [];
  const customerName = currentBill?.customerName || "";
  const saleNote = currentBill?.saleNote || "";

  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subTotal;

  const updateCurrentBill = (
    updates: Partial<{ cart: CartItem[]; customerName: string; saleNote: string }>,
  ) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === activeBill ? { ...bill, ...updates } : bill,
      ),
    );
  };

  const setCustomerName = (name: string) => updateCurrentBill({ customerName: name });
  const setSaleNote = (note: string) => updateCurrentBill({ saleNote: note });

  // ─── Cart functions ─────────────────────────────────────────
  const addToCart = (
    product: Product,
    opts?: {
      unitName: string;
      unitId?: string;
      quantity: number;
      weightGrams: number;
      unitPrice: number;
      totalPrice: number;
    },
  ) => {
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
    const unitName = product.unit?.name || "piece";
    const effectivePrice =
      product.discount && product.discount > 0
        ? product.salePrice - (product.salePrice * product.discount) / 100
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

  const categoriesRef = useRef<HTMLDivElement>(null);

  // ─── Filtered products ─────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.categoryId !== activeCategory)
        return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // ─── Unit helpers ──────────────────────────────────────────
  const isWeightUnit = (name: string | undefined | null) => {
    if (!name) return false;
    const lower = name.toLowerCase();
    return (
      lower === "kg" || lower === "gram" || lower === "ກິໂລ" || lower === "ກຣາມ"
    );
  };

  const getAvailableUnits = (product: Product): string[] => {
    const units: string[] = [];
    const unitName = product.unit?.name;
    if (unitName) units.push(unitName);
    if (
      product.weightPerUnit &&
      Number(product.weightPerUnit) > 0 &&
      !isWeightUnit(unitName)
    ) {
      units.push("ເຄິ່ງຖົງ", "12kg", "kg");
    }
    if (unitName?.toLowerCase() === "gram" && !units.includes("kg"))
      units.push("kg");
    if (units.length === 0) units.push("piece");
    return units;
  };

  const getPricePerKg = (product: Product): number => {
    if (product.pricePerKg && Number(product.pricePerKg) > 0)
      return Number(product.pricePerKg);
    if (product.weightPerUnit && Number(product.weightPerUnit) > 0) {
      return (
        Number(product.salePrice) / (Number(product.weightPerUnit) / 1000)
      );
    }
    return Number(product.salePrice);
  };

  const calculateSell = (product: Product, unitName: string, amount: number) => {
    const lower = unitName.toLowerCase();
    const pricePerKg = getPricePerKg(product);

    if (lower === "kg") {
      return {
        unitPrice: pricePerKg,
        totalPrice: Math.round(amount * pricePerKg),
        weightGrams: amount * 1000,
        quantity: 1,
      };
    }
    if (lower === "gram") {
      const pricePerGram = pricePerKg / 1000;
      return {
        unitPrice: pricePerKg,
        totalPrice: Math.round(amount * pricePerGram),
        weightGrams: amount,
        quantity: 1,
      };
    }
    if (unitName === "ເຄິ່ງຖົງ") {
      const halfBagPrice =
        product.pricePerHalfBag && Number(product.pricePerHalfBag) > 0
          ? Number(product.pricePerHalfBag)
          : product.salePrice / 2;
      const halfWeight = product.weightPerUnit
        ? Number(product.weightPerUnit) / 2
        : 0;
      return {
        unitPrice: halfBagPrice,
        totalPrice: Math.round(amount * halfBagPrice),
        weightGrams: amount * halfWeight,
        quantity: amount,
      };
    }
    if (unitName === "12kg") {
      const price12Kg =
        product.pricePer12Kg && Number(product.pricePer12Kg) > 0
          ? Number(product.pricePer12Kg)
          : pricePerKg * 12;
      return {
        unitPrice: price12Kg,
        totalPrice: Math.round(amount * price12Kg),
        weightGrams: amount * 12000,
        quantity: amount,
      };
    }
    const effectivePrice =
      product.discount && product.discount > 0
        ? product.salePrice - (product.salePrice * product.discount) / 100
        : product.salePrice;
    return {
      unitPrice: effectivePrice,
      totalPrice: Math.round(amount * effectivePrice),
      weightGrams: product.weightPerUnit
        ? amount * Number(product.weightPerUnit)
        : 0,
      quantity: amount,
    };
  };

  const calculateByCash = (
    product: Product,
    unitName: string,
    cashAmount: number,
  ) => {
    const lower = unitName.toLowerCase();
    const pricePerKg = getPricePerKg(product);

    if (lower === "kg") {
      const kg = cashAmount / pricePerKg;
      return {
        amount: Math.round(kg * 1000) / 1000,
        display: `${kg.toFixed(3)} kg`,
        weightGrams: kg * 1000,
      };
    }
    if (lower === "gram") {
      const grams = cashAmount / (pricePerKg / 1000);
      return {
        amount: Math.round(grams),
        display: `${Math.round(grams)} g`,
        weightGrams: Math.round(grams),
      };
    }
    if (unitName === "ເຄິ່ງຖົງ") {
      const halfBagPrice =
        product.pricePerHalfBag && Number(product.pricePerHalfBag) > 0
          ? Number(product.pricePerHalfBag)
          : product.salePrice / 2;
      const count = Math.floor(cashAmount / halfBagPrice);
      const halfWeight = product.weightPerUnit
        ? Number(product.weightPerUnit) / 2
        : 0;
      return {
        amount: count,
        display: `${count} ເຄິ່ງຖົງ`,
        weightGrams: count * halfWeight,
      };
    }
    if (unitName === "12kg") {
      const price12Kg =
        product.pricePer12Kg && Number(product.pricePer12Kg) > 0
          ? Number(product.pricePer12Kg)
          : pricePerKg * 12;
      const count = Math.floor(cashAmount / price12Kg);
      return {
        amount: count,
        display: `${count} x 12kg`,
        weightGrams: count * 12000,
      };
    }
    const effectivePrice =
      product.discount && product.discount > 0
        ? product.salePrice - (product.salePrice * product.discount) / 100
        : product.salePrice;
    const pieces = Math.floor(cashAmount / effectivePrice);
    return {
      amount: pieces,
      display: `${pieces} ${unitName}`,
      weightGrams: product.weightPerUnit
        ? pieces * Number(product.weightPerUnit)
        : 0,
    };
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    const availableUnits = getAvailableUnits(product);
    if (
      availableUnits.length > 1 ||
      isWeightUnit(product.unit?.name)
    ) {
      setShowSellModal({ product });
      const defaultUnit = product.unit?.name || availableUnits[0];
      setSelectedUnit(defaultUnit);
      setSellInput(!isWeightUnit(defaultUnit) ? "1" : "");
      setSellMode("amount");
      return;
    }
    addToCart(product);
  };

  const handleConfirmSellModal = () => {
    if (!showSellModal || !sellInput) return;
    const product = showSellModal.product;
    const amount = parseFloat(sellInput);
    if (isNaN(amount) || amount <= 0) return;

    if (sellMode === "cash") {
      const result = calculateByCash(product, selectedUnit, amount);
      if (result.amount <= 0) return;
      const calc = calculateSell(product, selectedUnit, result.amount);
      addToCart(product, {
        unitName: selectedUnit,
        unitId: product.unit?.id,
        quantity: calc.quantity,
        weightGrams: calc.weightGrams,
        unitPrice: calc.unitPrice,
        totalPrice: Math.round(amount),
      });
    } else {
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

  // Payment helpers
  const paymentAmount = parseInt(paymentInput) || 0;
  const changeAmount = paymentAmount - total;

  const handleNumpadPress = (key: string) => {
    if (key === "C") {
      setPaymentInput("0");
    } else if (key === "⌫") {
      setPaymentInput((prev) =>
        prev.length <= 1 ? "0" : prev.slice(0, -1),
      );
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
    setMobileCartOpen(false);
    setPaymentInput("0");
    setPaymentTab("cash");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (paymentTab === "cash" && changeAmount < 0) {
      toast.showToast("ເງິນບໍ່ພໍ", "error");
      return;
    }
    const userStr =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
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
      payments: [
        {
          paymentMethod: paymentTab === "cash" ? "cash" : "qr",
          currency: "KIP",
          amount: total,
        },
      ],
    });
    if (result.success) {
      toast.showToast("ຂາຍສຳເລັດແລ້ວ!", "success");
      setShowPaymentModal(false);

      const remainingBills = bills.filter((b) => b.id !== activeBill);
      if (remainingBills.length > 0) {
        setBills(remainingBills);
        setActiveBill(remainingBills[0].id);
      } else {
        const newId = 1;
        setBills([
          {
            id: newId,
            name: `ບິນ ${newId}`,
            cart: [],
            customerName: "",
            saleNote: "",
          },
        ]);
        setActiveBill(newId);
      }
      refetchProducts();
    } else {
      toast.showToast(result.message || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  };

  const handleExactAmount = () => setPaymentInput(String(total));

  const addNewBill = () => {
    const newId =
      bills.length > 0 ? Math.max(...bills.map((b) => b.id)) + 1 : 1;
    setBills((prev) => [
      ...prev,
      {
        id: newId,
        name: `ບິນ ${newId}`,
        cart: [],
        customerName: "",
        saleNote: "",
      },
    ]);
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

  // ─── Sub-components ─────────────────────────────────────────
  const BillPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Bill tabs */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        {bills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => setActiveBill(bill.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeBill === bill.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {bill.name}
            {bills.length > 1 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  closeBill(bill.id);
                }}
                className="hover:text-rose-200 cursor-pointer"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </span>
            )}
          </button>
        ))}
        <button
          onClick={addNewBill}
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
        >
          <FaPlus className="w-2.5 h-2.5" /> ບິນໃໝ່
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Customer */}
      <div className="px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="ຊື່ລູກຄ້າ (ບໍ່ບັງຄັບ)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
            <FaShoppingCart className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">ຍັງບໍ່ມີລາຍການ</p>
            <p className="text-xs mt-1 text-gray-400">
              ກົດເລືອກສິນຄ້າ
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cart.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="px-3 py-3 hover:bg-emerald-50/30 transition"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        {item.unit}
                      </span>
                      {item.weightGrams > 0 && (
                        <span className="text-blue-600">
                          {item.weightGrams >= 1000
                            ? `${(item.weightGrams / 1000).toFixed(2)} kg`
                            : `${item.weightGrams} g`}
                        </span>
                      )}
                      <span>₭ {formatMoney(item.unitPrice)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCartItem(idx)}
                    className="shrink-0 w-7 h-7 rounded-full text-rose-400 hover:text-white hover:bg-rose-500 flex items-center justify-center transition"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.weightGrams === 0 ? (
                      <>
                        <button
                          onClick={() => updateCartQty(idx, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                        >
                          <FaMinus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(idx, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center"
                        >
                          <FaPlus className="w-2.5 h-2.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">x {item.quantity}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    ₭ {formatMoney(item.totalPrice)}
                  </span>
                </div>
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
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      )}

      {/* Summary + actions */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>ລວມ ({cart.length} ລາຍການ)</span>
          <span className="font-semibold">₭ {formatMoney(subTotal)}</span>
        </div>
        <div className="flex justify-between items-end pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">ຕ້ອງຈ່າຍ</span>
          <span className="text-2xl font-bold text-emerald-700">
            ₭ {formatMoney(total)}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          {cart.length > 0 && (
            <button
              onClick={clearCurrentCart}
              className="px-3 py-3 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0 || submitting}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            {submitting ? "ກຳລັງບັນທຶກ…" : "ຢືນຢັນການຂາຍ"}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      {/* Page header */}
      <header className="sticky top-0 z-30 px-4 lg:px-6 py-3 bg-white/85 backdrop-blur border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
              ການຂາຍ
            </h1>
            <p className="hidden sm:block text-xs text-gray-500">
              ເລືອກສິນຄ້າ ແລະ ສ້າງບິນຂາຍ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs lg:text-sm font-semibold">
              {cart.length} ລາຍການ
            </div>
            <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-xs lg:text-sm font-bold shadow-sm">
              ₭ {formatMoney(total)}
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="p-3 lg:p-6 lg:pb-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-4">
          {/* LEFT — products */}
          <section className="flex flex-col gap-3 min-w-0">
            {/* Search + view toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາສິນຄ້າ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
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
              <button
                onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50"
                title="ສະຫຼັບມຸມມອງ"
              >
                {viewMode === "list" ? (
                  <FaTh className="w-4 h-4" />
                ) : (
                  <FaList className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Categories */}
            <div
              ref={categoriesRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
            >
              <button
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === "all"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                ທັງໝົດ
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeCategory === "all"
                      ? "bg-white/20"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {products.length}
                </span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                      active
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        active ? "bg-white/20" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Products container */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                  <p className="mt-3 text-sm">ກຳລັງໂຫຼດ…</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="text-6xl mb-3">📦</div>
                  <p className="text-sm">ບໍ່ພົບສິນຄ້າ</p>
                </div>
              ) : viewMode === "list" ? (
                /* List view — stacked cards */
                <div className="p-3 space-y-2">
                  {filteredProducts.map((product) => {
                    const hasWeight = Number(product.stockWeight) > 0;
                    const hasQty = product.stockQuantity > 0;
                    const hasStock = hasWeight || hasQty;
                    const stockDisplay = hasWeight
                      ? `${product.stockQuantity} (${(
                          Number(product.stockWeight) / 1000
                        ).toFixed(1)} kg)`
                      : `${product.stockQuantity}`;

                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                        disabled={!hasStock}
                        className="group relative w-full text-left overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                      >
                        {/* Status accent bar on the left */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            hasStock ? "bg-emerald-500" : "bg-rose-400"
                          }`}
                        />

                        <div className="pl-5 pr-4 py-3 flex items-center gap-3">
                          {/* Thumbnail */}
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="shrink-0 w-14 h-14 rounded-xl object-cover bg-gray-50 ring-1 ring-white"
                            />
                          ) : (
                            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl ring-1 ring-white">
                              🌱
                            </div>
                          )}

                          {/* Name + meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 truncate">
                                {product.name}
                              </span>
                              {/* {product.isPopular && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-orange-500">
                                  ຂາຍດີ
                                </span>
                              )}
                              {product.isSpecialOffer && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-rose-500">
                                  ສ່ວນຫຼຸດ
                                </span>
                              )} */}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                              {product.category && (
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {product.category.name}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                {product.unit?.name || "piece"}
                              </span>
                              {hasStock ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  ສະຕ໋ອກ {stockDisplay}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600">
                                  <FaTimes className="w-2.5 h-2.5" />
                                  ໝົດສະຕ໋ອກ
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right shrink-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400">
                              ລາຄາ
                            </p>
                            <p className="text-base font-bold text-emerald-700">
                              ₭ {formatMoney(product.salePrice)}
                            </p>
                          </div>

                          {/* Add chip */}
                          <div className="shrink-0 hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition group-disabled:bg-gray-100 group-disabled:text-gray-400">
                            <FaPlus className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Grid view — mobile + desktop */
                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredProducts.map((product) => {
                    const hasWeight = Number(product.stockWeight) > 0;
                    const hasQty = product.stockQuantity > 0;
                    const gridHasStock = hasWeight || hasQty;
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleAddToCart(product)}
                        disabled={!gridHasStock}
                        className="group relative text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">
                              🌱
                            </div>
                          )}
                          {/* {product.isPopular && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-orange-500">
                              ຂາຍດີ
                            </span>
                          )}
                          {product.isSpecialOffer && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-rose-500">
                              ສ່ວນຫຼຸດ
                            </span>
                          )} */}
                          {!gridHasStock && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
                                ໝົດສະຕ໋ອກ
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            {product.category?.name || ""}
                          </p>
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-end justify-between mt-2">
                            <span className="text-sm font-bold text-emerald-700">
                              ₭ {formatMoney(product.salePrice)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                gridHasStock
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {hasWeight
                                ? `${(Number(product.stockWeight) / 1000).toFixed(1)} kg`
                                : `${product.stockQuantity}`}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT — bill (desktop) */}
          <aside className="hidden lg:block sticky top-[80px] self-start">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-100px)]">
              <BillPanel />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile floating cart bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/0">
          <button
            onClick={() => setMobileCartOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
          >
            <span className="flex items-center gap-3">
              <span className="relative">
                <FaShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-orange-500 text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              </span>
              <span className="text-sm font-semibold">ເບິ່ງກະຕ່າ</span>
            </span>
            <span className="text-base font-bold">₭ {formatMoney(total)}</span>
          </button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileCartOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="w-12 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 overflow-hidden">
              <BillPanel onClose={() => setMobileCartOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* SELL MODAL */}
      {showSellModal &&
        (() => {
          const product = showSellModal.product;
          const availableUnits = getAvailableUnits(product);
          const pricePerKg = getPricePerKg(product);
          const inputVal = parseFloat(sellInput) || 0;

          let preview = { totalPrice: 0, display: "" };
          if (inputVal > 0) {
            if (sellMode === "cash") {
              const cashResult = calculateByCash(product, selectedUnit, inputVal);
              preview = { totalPrice: inputVal, display: cashResult.display };
            } else {
              const calc = calculateSell(product, selectedUnit, inputVal);
              preview = {
                totalPrice: calc.totalPrice,
                display: `₭ ${formatMoney(calc.totalPrice)}`,
              };
            }
          }

          return (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowSellModal(null)}
            >
              <div
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-3 mb-4">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                      🌱
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ₭ {formatMoney(product.salePrice)}/
                      {product.unit?.name || "piece"}
                      {pricePerKg !== product.salePrice &&
                        ` · ₭ ${formatMoney(pricePerKg)}/kg`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSellModal(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {availableUnits.map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setSelectedUnit(u);
                        setSellInput(!isWeightUnit(u) ? "1" : "");
                      }}
                      className={`flex-1 min-w-[70px] py-2 rounded-xl text-sm font-medium transition ${
                        selectedUnit === u
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSellMode("amount");
                      setSellInput("");
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                      sellMode === "amount"
                        ? "bg-emerald-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {isWeightUnit(selectedUnit) ? "ໃສ່ນ້ຳໜັກ" : "ໃສ່ຈຳນວນ"}
                  </button>
                  <button
                    onClick={() => {
                      setSellMode("cash");
                      setSellInput("");
                      setSelectedUnit("kg");
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                      sellMode === "cash"
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    💵 ຄິດໄລ່ຈາກເງິນ
                  </button>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    inputMode={sellMode === "cash" ? "numeric" : "decimal"}
                    placeholder={
                      sellMode === "cash"
                        ? "ໃສ່ຈຳນວນເງິນ (₭)"
                        : isWeightUnit(selectedUnit)
                        ? `ໃສ່ນ້ຳໜັກ (${selectedUnit})`
                        : "ໃສ່ຈຳນວນ"
                    }
                    value={
                      sellMode === "cash" && sellInput
                        ? Number(sellInput).toLocaleString("en-US")
                        : sellInput
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (raw === "" || raw === ".") {
                        setSellInput("");
                        return;
                      }
                      if (!isNaN(Number(raw))) setSellInput(raw);
                    }}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-xl text-center font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {sellMode === "cash" ? "₭" : selectedUnit}
                  </span>
                </div>

                {inputVal > 0 && (
                  <div
                    className={`rounded-xl p-3 mb-4 text-center ${
                      sellMode === "cash"
                        ? "bg-gradient-to-br from-orange-50 to-amber-100"
                        : "bg-gradient-to-br from-emerald-50 to-emerald-100"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        sellMode === "cash"
                          ? "text-orange-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {sellMode === "cash" ? "ລູກຄ້າໄດ້ຮັບ" : "ລາຄາ"}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        sellMode === "cash"
                          ? "text-orange-900"
                          : "text-emerald-900"
                      }`}
                    >
                      {preview.display}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSellModal(null)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    onClick={handleConfirmSellModal}
                    disabled={inputVal <= 0}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40"
                  >
                    ເພີ່ມໃສ່ບິນ
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">ຕ້ອງຈ່າຍ</p>
                  <p className="text-2xl font-bold">₭ {formatMoney(total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80">
                    {changeAmount >= 0 ? "ເງິນທອນ" : "ຍັງຂາດ"}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      changeAmount < 0 ? "text-rose-300" : ""
                    }`}
                  >
                    ₭ {formatMoney(Math.abs(changeAmount))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setPaymentTab("cash")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  paymentTab === "cash"
                    ? "border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                💵 ເງິນສົດ
              </button>
              <button
                onClick={() => setPaymentTab("qr")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  paymentTab === "qr"
                    ? "border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                📱 QR
              </button>
            </div>

            {paymentTab === "cash" ? (
              <div className="p-4 space-y-3">
                <div className="border-2 border-emerald-200 rounded-2xl px-4 py-3 bg-emerald-50/30 text-right">
                  <p className="text-[10px] text-gray-500">ຮັບເງິນ</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₭ {formatMoney(paymentAmount)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000, 20000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      className="py-2 rounded-xl text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    >
                      +{formatMoney(amount)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map(
                    (key) => (
                      <button
                        key={key}
                        onClick={() => handleNumpadPress(key)}
                        className={`py-4 rounded-xl text-lg font-semibold transition ${
                          key === "C" || key === "⌫"
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {key}
                      </button>
                    ),
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExactAmount}
                    className="flex-1 py-3 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    ເງິນພໍດີ
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={changeAmount < 0 || submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40 shadow-sm"
                  >
                    {submitting ? "ບັນທຶກ…" : "ຢືນຢັນຊຳລະ"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                {currentUser?.bankAccountImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.bankAccountImageUrl}
                    alt="QR"
                    className="mx-auto mb-4 max-h-56 object-contain rounded-xl border border-gray-200"
                  />
                ) : (
                  <>
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-xs text-gray-500 mb-2">
                      ກະລຸນາຕັ້ງຄ່າ QR ໃນຕັ້ງຄ່າຮ້ານ
                    </p>
                  </>
                )}
                <p className="text-gray-500 text-sm mb-2">ສະແກນ QR ເພື່ອຊຳລະ</p>
                <p className="text-2xl font-bold text-emerald-700 mb-5">
                  ₭ {formatMoney(total)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40"
                  >
                    {submitting ? "ບັນທຶກ…" : "ຢືນຢັນຊຳລະ"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
