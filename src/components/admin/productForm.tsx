"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/lib/types/category";
import { Product, CreateProductData } from "@/lib/types/product";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  basePrice: z.number().positive("Base price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  variants: z.array(
    z.object({
      name: z.string().min(1, "Variant name is required"),
      size: z.string().min(1, "Size is required"),
      basePrice: z.number().positive(),
      sellingPrice: z.number().positive(),
      isAvailable: z.boolean(),
    })
  ),
  images: z.array(z.string().url()).default([]),
  ingredients: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: CreateProductData) => Promise<void>;
  initialData?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          categoryId: initialData.categoryId,
          basePrice: initialData.basePrice,
          sellingPrice: initialData.sellingPrice,
          variants: initialData.variants,
          images: initialData.images,
          ingredients: initialData.ingredients,
        }
      : {
          variants: [],
          images: [],
          ingredients: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi().getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as CreateProductData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Basic Information
          </h2>

          <Input
            {...register("name")}
            label="Product Name"
            placeholder="e.g., Margherita Pizza"
            error={errors.name?.message}
          />

          <Input
            {...register("slug")}
            label="Slug"
            placeholder="e.g., margherita-pizza"
            error={errors.slug?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
              placeholder="Product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {Array.isArray(categories)&&categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Pricing
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              {...register("basePrice", { valueAsNumber: true })}
              type="number"
              label="Base Price"
              placeholder="0"
              error={errors.basePrice?.message}
            />

            <Input
              {...register("sellingPrice", { valueAsNumber: true })}
              type="number"
              label="Selling Price"
              placeholder="0"
              error={errors.sellingPrice?.message}
            />
          </div>
        </div>
      </Card>

      {/* Variants */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Variants
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  size: "",
                  basePrice: 0,
                  sellingPrice: 0,
                  isAvailable: true,
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variant
            </Button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Variant {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  {...register(`variants.${index}.name`)}
                  label="Name"
                  placeholder="e.g., Small"
                  error={errors.variants?.[index]?.name?.message}
                />
                <Input
                  {...register(`variants.${index}.size`)}
                  label="Size"
                  placeholder="e.g., 250ml"
                  error={errors.variants?.[index]?.size?.message}
                />
                <Input
                  {...register(`variants.${index}.basePrice`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  label="Base Price"
                  placeholder="0"
                  error={errors.variants?.[index]?.basePrice?.message}
                />
                <Input
                  {...register(`variants.${index}.sellingPrice`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  label="Selling Price"
                  placeholder="0"
                  error={errors.variants?.[index]?.sellingPrice?.message}
                />
              </div>

              <div className="mt-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`variants.${index}.isAvailable`)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Available
                  </span>
                </label>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No variants added. Click "Add Variant" to create one.
            </p>
          )}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};
