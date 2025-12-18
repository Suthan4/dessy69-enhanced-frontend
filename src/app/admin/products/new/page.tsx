"use client";

import { useRouter } from "next/navigation";
import { productsApi } from "@/lib/api/products";
import { CreateProductData } from "@/lib/types/product";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/productForm";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProductData) => {
    try {
      await productsApi().create(data);
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to create product");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Add New Product
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new menu item
        </p>
      </div>

      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}
