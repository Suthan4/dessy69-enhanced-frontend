"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { categoriesApi } from "@/lib/api/categories";
import { Category, CategoryTree } from "@/lib/types/category";
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
/* -------------------- Flatten Helper -------------------- */
type FlatCategory = {
  id: string;
  label: string;
  level: number;
  isParent: boolean;
};

function flattenCategories(
  categories: CategoryTree[],
  parentLabel = ""
): FlatCategory[] {
  let result: FlatCategory[] = [];

  for (const cat of categories) {
    const label = parentLabel ? `${parentLabel} › ${cat.name}` : cat.name;

    const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;

    result.push({
      id: cat.id,
      label,
      level: cat.level,
      isParent: hasChildren, // 🔴 parents will be disabled
    });

    if (hasChildren) {
      result.push(...flattenCategories(cat.children!, label));
    }
  }

  return result;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
}) => {
const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Autocomplete state */
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
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

  /* -------------------- Load Categories -------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await categoriesApi().getAll();
        setCategories(res.data);
      } catch {
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  /* -------------------- Flatten + Filter -------------------- */
  const flatCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const filtered = flatCategories.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  /* Pre-fill on edit */
  useEffect(() => {
    if (initialData && flatCategories.length) {
      const selected = flatCategories.find(
        (c) => c.id === initialData.categoryId
      );
      if (selected) setSearch(selected.label);
    }
  }, [initialData, flatCategories]);

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
  console.log("categories", categories);

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

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {Array.isArray(categories) &&
                categories?.map((cat: Category) => (
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
          </div> */}
          {/* -------- Category Autocomplete -------- */}
          <div className="relative">
            <label className="text-sm font-medium mb-1 block">Category</label>

            <Input
              value={search}
              placeholder="Search category..."
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              error={errors.categoryId?.message}
            />

            {open && (
              <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow">
                {filtered.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No categories found
                  </div>
                )}

                {filtered.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={cat.isParent}
                    onClick={() => {
                      if (cat.isParent) return; // 🚫 parent blocked
                      setValue("categoryId", cat.id, {
                        shouldValidate: true,
                      });
                      setSearch(cat.label);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm text-gray-950 ${
                      cat.isParent
                        ? "text-gray-400 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span style={{ paddingLeft: cat.level * 12 }}>
                      {cat.label}
                      {cat.isParent && " (select sub-category)"}
                    </span>
                  </button>
                ))}
              </div>
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
              leftIcon={<Plus className="w-4 h-4 " />}
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
