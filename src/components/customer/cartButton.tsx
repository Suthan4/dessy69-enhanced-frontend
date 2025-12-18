"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export const CartButton: React.FC = () => {
  const { getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  if (itemCount === 0) {
    return (
      <Link
        href="/cart"
        className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "fixed bottom-4 right-4 z-30",
        "flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4",
        "bg-gradient-to-r from-primary-500 to-primary-600",
        "text-white rounded-full shadow-glow",
        "hover:shadow-2xl transition-all duration-300",
        "active:scale-95"
      )}
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
          {itemCount}
        </span>
      </div>
      <div className="hidden sm:block">
        <div className="text-xs opacity-90">View Cart</div>
        <div className="font-bold">{formatCurrency(total)}</div>
      </div>
    </Link>
  );
};
