"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coupon } from "@/lib/types/coupon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().min(0, "Must be 0 or greater"),
  maxDiscount: z.number().positive("Max discount must be positive"),
  usageLimit: z.number().int().positive("Must be a positive integer"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: Coupon;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          type: initialData.type,
          value: initialData.value,
          minOrderAmount: initialData.minOrderAmount,
          maxDiscount: initialData.maxDiscount,
          usageLimit: initialData.usageLimit,
          startDate: new Date(initialData.startDate).toISOString().slice(0, 16),
          endDate: new Date(initialData.endDate).toISOString().slice(0, 16),
          isActive: initialData.isActive,
        }
      : {
          type: "percentage",
          minOrderAmount: 0,
          isActive: true,
        },
  });

  const couponType = watch("type");

  const handleFormSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    try {
       const payload = {
         ...data,
         startDate: new Date(data.startDate).toISOString(),
         endDate: new Date(data.endDate).toISOString(),
       };
      await onSubmit(payload);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        {...register("code")}
        label="Coupon Code"
        placeholder="e.g., SUMMER50"
        error={errors.code?.message}
        className="uppercase"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Discount Type
        </label>
        <select
          {...register("type")}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          {...register("value", { valueAsNumber: true })}
          type="number"
          label={
            couponType === "percentage"
              ? "Discount Percentage"
              : "Discount Amount"
          }
          placeholder={couponType === "percentage" ? "0-100" : "0"}
          error={errors.value?.message}
        />

        <Input
          {...register("maxDiscount", { valueAsNumber: true })}
          type="number"
          label="Max Discount Amount"
          placeholder="0"
          error={errors.maxDiscount?.message}
        />
      </div>

      <Input
        {...register("minOrderAmount", { valueAsNumber: true })}
        type="number"
        label="Minimum Order Amount"
        placeholder="0"
        error={errors.minOrderAmount?.message}
      />

      <Input
        {...register("usageLimit", { valueAsNumber: true })}
        type="number"
        label="Usage Limit"
        placeholder="100"
        error={errors.usageLimit?.message}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="datetime-local"
            {...register("startDate")}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="datetime-local"
            {...register("endDate")}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Active
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {initialData ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
};
