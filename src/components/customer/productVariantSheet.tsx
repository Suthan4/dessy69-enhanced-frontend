"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";
import { Product, ProductVariant } from "@/lib/types/product";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";

interface ProductVariantSheetProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductVariantSheet: React.FC<ProductVariantSheetProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size");
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      variantSize: selectedVariant.size,
      quantity,
      price: selectedVariant.sellingPrice,
      image: product.images[0] || "",
    });

    toast.success(`${quantity}x ${product.name} added to cart`);
    onClose();
  };

  const totalPrice = selectedVariant
    ? selectedVariant.sellingPrice * quantity
    : 0;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Product Header */}
      <div className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <Image
            src={product.images[0] || "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {product.description}
          </p>
        </div>
      </div>

      {/* Variant Selection */}
      <div className="py-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Size
            </h4>
            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
              Required
            </span>
          </div>
          <div className="space-y-2">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const hasDiscount = variant.basePrice > variant.sellingPrice;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((variant.basePrice - variant.sellingPrice) /
                      variant.basePrice) *
                      100
                  )
                : 0;

              return (
                <button
                  key={variant.id}
                  onClick={() =>
                    variant.isAvailable && setSelectedVariant(variant)
                  }
                  disabled={!variant.isAvailable}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950/50"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio Button */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Variant Info */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {variant.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({variant.size})
                        </span>
                      </div>
                      {!variant.isAvailable && (
                        <span className="text-xs text-red-500">
                          Not available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(variant.sellingPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(variant.basePrice)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ingredients (if available) */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Ingredients
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 space-y-4">
        {/* Quantity Selector */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Quantity
          </span>
          <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 min-w-[30px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">
              Total
            </span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="flex-1"
            size="lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
