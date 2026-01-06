"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { productsApi } from "@/lib/api/products";
import { Product } from "@/lib/types/product";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import Image from "next/image";


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi().getAll({
        page: 1,
        limit: 10,
        isAvailable: true,
      });
      setProducts(data.items);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await productsApi().updateAvailability(product.id, !product.isAvailable);
      toast.success(
        `Product ${product.isAvailable ? "disabled" : "enabled"} successfully`
      );
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      await productsApi().delete(deleteModal.product.id);
      toast.success("Product deleted successfully");
      setDeleteModal({ isOpen: false, product: null });
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading products..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your menu items ({products?.length})
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button leftIcon={<Plus className="w-5 h-5" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product: any) => (
          <Card key={product.id}>
            <div className="p-4">
              {/* Product Image */}
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                <Image
                  src={product.images[0] || "/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="error">Unavailable</Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  {product.basePrice > product.sellingPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.basePrice)}
                    </span>
                  )}
                </div>

                {product.variants.length > 0 && (
                  <Badge variant="info">
                    {product.variants.length} variant
                    {product.variants.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link href={`/admin/products/${product.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleAvailability(product)}
                >
                  {product.isAvailable ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteModal({ isOpen: true, product })}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{deleteModal.product?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
