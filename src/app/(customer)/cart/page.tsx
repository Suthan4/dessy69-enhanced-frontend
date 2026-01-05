'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatCurrency } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { couponsApi } from '@/lib/api/coupons';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    couponCode,
    discount,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDeliveryCharge,
    getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const result = await couponsApi().validate({
        code: couponInput,
        orderAmount: subtotal,
        productIds: items.map((item) => item.productId),
        categoryIds: [],
      });

      if (result?.data?.valid) {
        applyCoupon(couponInput, result?.data?.discount);
        toast.success('Coupon applied successfully!');
        setCouponInput('');
      } else {
        toast.error(result?.data?.reason || 'Invalid coupon');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some delicious items to get started
          </p>
          <Link href="/menu">
            <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/menu">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Shopping Cart
          </h1>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`}>
              <div className="flex gap-4 p-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.productName}
                  </h3>
                  {item.variantName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.variantName} {item.variantSize && `(${item.variantSize})`}
                    </p>
                  )}
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.variantId
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-primary-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.variantId
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-primary-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Coupon Section */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Apply Coupon
            </h3>
            {couponCode ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {couponCode}
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-500 ml-2">
                    applied
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  isLoading={isValidating}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Bill Summary */}
        <Card className="mb-6">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Bill Summary
            </h3>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Charge</span>
              <span>
                {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
              </span>
            </div>
            {subtotal < 500 && (
              <p className="text-xs text-gray-500">
                Add {formatCurrency(500 - subtotal)} more for free delivery
              </p>
            )}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Checkout Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full"
              size="lg"
            >
              Proceed to Checkout
              <span className="ml-2 font-bold">{formatCurrency(total)}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}