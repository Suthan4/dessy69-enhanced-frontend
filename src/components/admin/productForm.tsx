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
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  categoryId: z.string().min(1),

  basePrice: z.number().positive(),
  sellingPrice: z.number().positive(),

  variants: z.array(
    z.object({
      name: z.string().min(1),
      size: z.string().min(1),
      basePrice: z.number().positive(),
      sellingPrice: z.number().positive(),
      isAvailable: z.boolean(),
      sku: z.string().optional(),
      stock: z.number().int().optional(),
    })
  ),

  images: z.array(z.string().url()).optional(),

  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.string().optional(),
        isOptional: z.boolean(),
        additionalPrice: z.number().optional(),
        allergens: z.array(z.string()).optional(),
      })
    )
    .optional(),

  nutrition: z.object({
    calories: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().optional()),
    protein: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().optional()),
    carbs: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().optional()),
    fat: z.preprocess((val) => {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().optional()),
  }),

  metadata: z
    .object({
      shelfLife: z.string().optional(),
      storageInstructions: z.string().optional(),
      countryOfOrigin: z.string().optional(),
    })
    .optional(),
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
/* -------------------- Allergen Chips -------------------- */
const ChipsInput = ({
  value = [],
  onChange,
  placeholder,
}: {
  value?: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) => {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setInput("");
  };

  return (
    <div className="border rounded-xl px-3 py-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((chip) => (
          <span
            key={chip}
            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-primary rounded-full text-sm"
          >
            {chip}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== chip))}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder={placeholder}
        className="w-full outline-none bg-transparent text-sm"
      />
    </div>
  );
};

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

  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

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
      console.log(error);

    } finally {
      setIsSubmitting(false);
    }
  };
  console.log("categories", categories);
  console.log("errors", errors);

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
              Variants (Optional)
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 " />}
              onClick={() =>
                addVariant({
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

          {variantFields.map((field, index) => (
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
                  onClick={() => removeVariant(index)}
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

          {variantFields.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No variants added. Click "Add Variant" to create one.
            </p>
          )}
        </div>
      </Card>
      {/* Ingridents */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ingridients (Optional)
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4 " />}
              onClick={() =>
                addIngredient({
                  name: "",
                  quantity: "",
                  isOptional: false,
                  additionalPrice: 0,
                  allergens: [""],
                })
              }
            >
              Add Ingridients
            </Button>
          </div>

          {ingredientFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Ingridents {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  {...register(`ingredients.${index}.name`)}
                  label="Name"
                />
                <Input
                  {...register(`ingredients.${index}.quantity`)}
                  label="Quantity"
                />
                <ChipsInput
                  value={watch(`ingredients.${index}.allergens`)}
                  onChange={(v) =>
                    setValue(`ingredients.${index}.allergens`, v)
                  }
                  placeholder="Milk, Nuts"
                />
              </div>

              {/* <div className="mt-3">
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
              </div> */}
            </div>
          ))}

          {ingredientFields?.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No Ingridients added. Click "Add Ingridients" to create one.
            </p>
          )}
        </div>
      </Card>

      {/* NUTRITION */}
      <Card>
        <div className="p-6">
          <details>
            <summary className="font-semibold cursor-pointer">
              Nutrition Information (optional)
            </summary>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Input
                type="number"
                placeholder="Calories"
                {...register("nutrition.calories", { setValueAs: (v) => (v === "" ? undefined : Number(v))})}
              />
              <Input
                type="number"
                placeholder="Protein"
                {...register("nutrition.protein", { setValueAs: (v) => (v === "" ? undefined : Number(v))})}
              />
              <Input
                type="number"
                placeholder="Carbs"
                {...register("nutrition.carbs", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
              <Input
                type="number"
                placeholder="Fat"
                {...register("nutrition.fat", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
            </div>
          </details>
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
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Plus, Trash2 } from "lucide-react";
// import { categoriesApi } from "@/lib/api/categories";
// import { CategoryTree } from "@/lib/types/category";
// import { Product, CreateProductData } from "@/lib/types/product";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";
// import { toast } from "sonner";

/* -------------------- Schema -------------------- */
// const productSchema = z.object({
//   name: z.string().min(2),
//   slug: z.string().regex(/^[a-z0-9-]+$/),
//   description: z.string().min(10),
//   categoryId: z.string().min(1),

//   basePrice: z.number().positive(),
//   sellingPrice: z.number().positive(),

//   variants: z.array(
//     z.object({
//       name: z.string().min(1),
//       size: z.string().min(1),
//       basePrice: z.number().positive(),
//       sellingPrice: z.number().positive(),
//       isAvailable: z.boolean(),
//       sku: z.string().optional(),
//       stock: z.number().int().optional(),
//     })
//   ),

//   images: z.array(z.string().url()).optional(),

//   ingredients: z
//     .array(
//       z.object({
//         name: z.string().min(1),
//         quantity: z.string().optional(),
//         isOptional: z.boolean(),
//         additionalPrice: z.number().optional(),
//         allergens: z.array(z.string()).optional(),
//       })
//     )
//     .optional(),

//   nutrition: z
//     .object({
//       calories: z.number().optional(),
//       protein: z.number().optional(),
//       carbs: z.number().optional(),
//       fat: z.number().optional(),
//     })
//     .optional(),
// });

// type ProductFormData = z.infer<typeof productSchema>;

// interface ProductFormProps {
//   onSubmit: (data: CreateProductData) => Promise<void>;
//   initialData?: Product;
// }

// /* -------------------- Helpers -------------------- */
// type FlatCategory = {
//   id: string;
//   label: string;
//   level: number;
//   isParent: boolean;
// };

// function flattenCategories(
//   categories: CategoryTree[],
//   parentLabel = ""
// ): FlatCategory[] {
//   let result: FlatCategory[] = [];

//   for (const cat of categories) {
//     const label = parentLabel ? `${parentLabel} › ${cat.name}` : cat.name;
//     const hasChildren = cat.children?.length;

//     result.push({
//       id: cat.id,
//       label,
//       level: cat.level,
//       isParent: !!hasChildren,
//     });

//     if (hasChildren) {
//       result.push(...flattenCategories(cat.children!, label));
//     }
//   }

//   return result;
// }

// /* -------------------- Allergen Chips -------------------- */
// const ChipsInput = ({
//   value = [],
//   onChange,
//   placeholder,
// }: {
//   value?: string[];
//   onChange: (val: string[]) => void;
//   placeholder?: string;
// }) => {
//   const [input, setInput] = useState("");

//   const add = () => {
//     const v = input.trim();
//     if (!v || value.includes(v)) return;
//     onChange([...value, v]);
//     setInput("");
//   };

//   return (
//     <div className="border rounded-xl px-3 py-2 space-y-2">
//       <div className="flex flex-wrap gap-2">
//         {value.map((chip) => (
//           <span
//             key={chip}
//             className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded-full text-sm"
//           >
//             {chip}
//             <button
//               type="button"
//               onClick={() => onChange(value.filter((v) => v !== chip))}
//             >
//               ✕
//             </button>
//           </span>
//         ))}
//       </div>

//       <input
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
//         placeholder={placeholder}
//         className="w-full outline-none bg-transparent text-sm"
//       />
//     </div>
//   );
// };

// /* -------------------- Component -------------------- */
// export const ProductForm: React.FC<ProductFormProps> = ({
//   onSubmit,
//   initialData,
// }) => {
//   const [categories, setCategories] = useState<CategoryTree[]>([]);
//   const [search, setSearch] = useState("");
//   const [open, setOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<ProductFormData>({
//     resolver: zodResolver(productSchema),
//     defaultValues: initialData
//       ? { ...initialData }
//       : { variants: [], ingredients: [] },
//   });

//   const {
//     fields: variantFields,
//     append: addVariant,
//     remove: removeVariant,
//   } = useFieldArray({ control, name: "variants" });

//   const {
//     fields: ingredientFields,
//     append: addIngredient,
//     remove: removeIngredient,
//   } = useFieldArray({ control, name: "ingredients" });

//   useEffect(() => {
//     categoriesApi()
//       .getAll()
//       .then((res) => setCategories(res.data))
//       .catch(() => toast.error("Failed to load categories"));
//   }, []);

//   const flatCategories = useMemo(
//     () => flattenCategories(categories),
//     [categories]
//   );

//   const filtered = flatCategories.filter((c) =>
//     c.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const submit = async (data: ProductFormData) => {
//     setIsSubmitting(true);
//     await onSubmit(data as CreateProductData);
//     setIsSubmitting(false);
//   };

//   return (
//     <form onSubmit={handleSubmit(submit)} className="space-y-6">
//       {/* BASIC INFO */}
//       <Card>
//         <div className="p-6 space-y-4">
//           <Input {...register("name")} label="Product Name" />
//           <Input {...register("slug")} label="Slug" />
//           <textarea
//             {...register("description")}
//             className="w-full border rounded-xl p-3"
//           />
//         </div>
//       </Card>

//       {/* VARIANTS */}
//       <Card>
//         <div className="p-6 space-y-4">
//           <div className="flex justify-between">
//             <h2 className="font-semibold">Variants</h2>
//             <Button
//               type="button"
//               onClick={() =>
//                 addVariant({
//                   name: "",
//                   size: "",
//                   basePrice: 0,
//                   sellingPrice: 0,
//                   isAvailable: true,
//                 })
//               }
//             >
//               <Plus className="w-4 h-4" /> Add
//             </Button>
//           </div>

//           {variantFields.map((v, i) => (
//             <div key={v.id} className="border p-4 rounded-xl space-y-3">
//               <Input {...register(`variants.${i}.name`)} label="Name" />
//               <Input {...register(`variants.${i}.size`)} label="Size" />
//               <Input
//                 type="number"
//                 {...register(`variants.${i}.basePrice`, {
//                   valueAsNumber: true,
//                 })}
//                 label="Base Price"
//               />
//               <Input
//                 type="number"
//                 {...register(`variants.${i}.sellingPrice`, {
//                   valueAsNumber: true,
//                 })}
//                 label="Selling Price"
//               />
//               <button type="button" onClick={() => removeVariant(i)}>
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* INGREDIENTS */}
//       <Card>
//         <div className="p-6 space-y-4">
//           <div className="flex justify-between">
//             <h2 className="font-semibold">Ingredients</h2>
//             <Button
//               type="button"
//               onClick={() => addIngredient({ name: "", isOptional: false })}
//             >
//               <Plus className="w-4 h-4" /> Add
//             </Button>
//           </div>

//           {ingredientFields.map((f, i) => (
//             <div key={f.id} className="border p-4 rounded-xl space-y-3">
//               <Input {...register(`ingredients.${i}.name`)} label="Name" />
//               <Input
//                 {...register(`ingredients.${i}.quantity`)}
//                 label="Quantity"
//               />
//               <ChipsInput
//                 value={watch(`ingredients.${i}.allergens`)}
//                 onChange={(v) => setValue(`ingredients.${i}.allergens`, v)}
//                 placeholder="Milk, Nuts"
//               />
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* NUTRITION */}
//       <Card>
//         <div className="p-6">
//           <details>
//             <summary className="font-semibold cursor-pointer">
//               Nutrition Information
//             </summary>
//             <div className="grid sm:grid-cols-2 gap-4 mt-4">
//               <Input
//                 type="number"
//                 label="Calories"
//                 {...register("nutrition.calories", { valueAsNumber: true })}
//               />
//               <Input
//                 type="number"
//                 label="Protein"
//                 {...register("nutrition.protein", { valueAsNumber: true })}
//               />
//               <Input
//                 type="number"
//                 label="Carbs"
//                 {...register("nutrition.carbs", { valueAsNumber: true })}
//               />
//               <Input
//                 type="number"
//                 label="Fat"
//                 {...register("nutrition.fat", { valueAsNumber: true })}
//               />
//             </div>
//           </details>
//         </div>
//       </Card>

//       <Button type="submit" isLoading={isSubmitting}>
//         {initialData ? "Update Product" : "Create Product"}
//       </Button>
//     </form>
//   );
// };
