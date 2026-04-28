"use client";

import { useState, useCallback } from "react";
import type { Product } from "@/src/features/stock/useProduct";
import type { CartItem } from "./useSale";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [saleNote, setSaleNote] = useState("");

  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subTotal;

  const addToCart = useCallback((product: Product, weightGrams?: number, weightUnit?: "kg" | "gram") => {
    // Weight-based item (from modal)
    if (weightGrams && weightGrams > 0) {
      const pricePerKg = product.pricePerKg ? Number(product.pricePerKg) : product.salePrice;
      const totalPrice = (weightGrams / 1000) * pricePerKg;

      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          unit: weightUnit || "kg",
          categoryName: product.category?.name || "other",
          quantity: 1,
          weightGrams,
          unitPrice: pricePerKg,
          totalPrice: Math.round(totalPrice),
          salePrice: product.salePrice,
          pricePerKg,
        },
      ]);
      return;
    }

    // Piece/bag based: add 1
    setCart((prev) => {
      const unit = product.unit?.name || "piece";
      const existing = prev.find((c) => c.productId === product.id && c.unit === unit);
      if (existing) {
        return prev.map((c) =>
          c.productId === product.id && c.unit === unit
            ? {
                ...c,
                quantity: c.quantity + 1,
                totalPrice: (c.quantity + 1) * c.unitPrice,
              }
            : c
        );
      }

      const effectivePrice = product.discount && product.discount > 0
        ? product.salePrice - (product.salePrice * product.discount / 100)
        : product.salePrice;

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          unit,
          categoryName: product.category?.name || "other",
          quantity: 1,
          weightGrams: 0,
          unitPrice: effectivePrice,
          totalPrice: effectivePrice,
          salePrice: product.salePrice,
          pricePerKg: product.pricePerKg ? Number(product.pricePerKg) : undefined,
        },
      ];
    });
  }, []);

  const updateCartQty = useCallback((index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          totalPrice: item.weightGrams > 0
            ? item.totalPrice
            : newQty * item.unitPrice,
        };
      })
    );
  }, []);

  const removeCartItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerName("");
    setSaleNote("");
  }, []);

  return {
    cart,
    customerName,
    setCustomerName,
    saleNote,
    setSaleNote,
    subTotal,
    total,
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
  };
}
