"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Product } from "@/lib/types/product";
import { formatCurrency } from "@/lib/utils/formatters";
import { useCartStore } from "@/lib/store/cartStore";
import { Badge } from "../ui/Badge";
import { ProductVariantSheet } from "./productVariantSheet";

interface ProductCardProps {
  product: Product;
}

 const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { items, updateQuantity } = useCartStore();
 
  // Find if product is in cart
  const cartItem = items.find(
    (item:any) => item.productId === product.id && !item.variantId
  );
  const quantity = cartItem?.quantity || 0;

  const handleQuickAdd = () => {
    if (product.variants.length > 0) {
      setIsSheetOpen(true);
    } else {
      // Simple product, add directly
      useCartStore.getState().addItem({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        image: product.images[0] || "",
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
  };

  const startingPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.sellingPrice))
      : product.sellingPrice;

  const hasDiscount = product.basePrice > product.sellingPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.basePrice - product.sellingPrice) / product.basePrice) * 100
      )
    : 0;
 console.log("product", product);

  return (
    <>
      <div className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-800">
        {/* Product Image - Left Side */}
        <div className="relative flex-shrink-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={product.images[0] || "/images/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 96px"
            />
          </div>

          {/* Badges */}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
              <span className="text-xs font-semibold text-white">Sold Out</span>
            </div>
          )}

          {hasDiscount && product.isAvailable && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
              {discountPercent}%
            </div>
          )}
        </div>

        {/* Product Info - Right Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Product Name & Description */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              {product.variants.length > 0 && (
                <span className="text-xs text-gray-500">From</span>
              )}
              <span className="font-bold text-primary-600 dark:text-primary-400 text-base sm:text-lg">
                {formatCurrency(startingPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.basePrice)}
                </span>
              )}
            </div>

            {/* Add Button or Quantity Controls */}
            {!product.isAvailable ? (
              <Badge variant="error" className="text-xs">
                Unavailable
              </Badge>
            ) : quantity > 0 && product.variants.length === 0 ? (
              <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-950 rounded-lg px-2 py-1">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 rounded transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-semibold text-primary-600 min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900 rounded transition-colors"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:shadow-glow transition-all duration-200 active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {product.variants.length > 0 ? "Customize" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Variant Selection Bottom Sheet */}
      {isSheetOpen && (
        <ProductVariantSheet
          product={product}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </>
  );
};
export default ProductCard;
