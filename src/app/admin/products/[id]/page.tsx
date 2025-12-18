'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { Product, CreateProductData } from '@/lib/types/product';
import { Loading } from '@/components/ui/Loading';
import { toast } from 'sonner';
import { ProductForm } from '@/components/admin/productForm';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await productsApi().getById(params.id as string);
      setProduct(data);
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CreateProductData) => {
    try {
      await productsApi().update(params.id as string, data);
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
      throw error;
    }
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading product..." />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Edit Product
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update product details
        </p>
      </div>

      <ProductForm onSubmit={handleSubmit} initialData={product} />
    </div>
  );
}
