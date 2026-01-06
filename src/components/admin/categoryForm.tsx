"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@/lib/types/category";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  parentId: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: Category;
  categories: Category[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  initialData,
  categories,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          parentId: initialData.parentId,
        }
      : undefined,
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
        const cleanedData = {
          ...data,
          parentId: data.parentId || undefined,
        };
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        {...register("name")}
        label="Category Name"
        placeholder="e.g., Ice Creams"
        error={errors.name?.message}
      />

      <Input
        {...register("slug")}
        label="Slug"
        placeholder="e.g., ice-creams"
        error={errors.slug?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (Optional)
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
          placeholder="Category description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Parent Category (Optional)
        </label>
        <select
          {...register("parentId")}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">None (Root Category)</option>
          {categories
            .filter((cat) => cat.level === 0 && cat.id !== initialData?.id)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
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
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};
