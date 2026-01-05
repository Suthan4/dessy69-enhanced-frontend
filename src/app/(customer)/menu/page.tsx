import React, { Suspense } from "react";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { CategoryFilter } from "@/components/customer/categoryFilter";
import { SearchBar } from "@/components/customer/searchBar";
import { CartButton } from "@/components/customer/cartButton";
import { Loading } from "@/components/ui/Loading";
import ProductCard from "@/components/customer/productCard";

interface MenuPageProps {
  searchParams: {
    q?: string;
    category?: string;
    page?: string;
  };
}

async function MenuContent({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const query = params.q;
  const categoryId = params.category;
  const page = parseInt(params.page || "1");

  // Fetch data
  let productsData: { items: any[]; total: number };
  let categories: any;
  try {
    [productsData, categories] = await Promise.all([
      query
        ? productsApi().search(query, page, 20)
        : productsApi().getAll({
            page,
            limit: 20,
            categoryId,
            isAvailable: true,
          }),
      categoriesApi().getAll(),
    ]);
  } catch (error: any) {
    console.error("Error fetching menu data:", error);
    // fallback so RSC doesn’t crash
    productsData = { items: [], total: 0 };
    categories = [];
  }

  const products = productsData.items || [];
  const total = productsData.total || 0;
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gradient-primary">Menu</h1>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 max-w-7xl mx-auto px-4">
        <CategoryFilter categories={categories} />
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {query && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {total} results for "{query}"
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* {products.length || productsData.total === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No products found
            </p>
          </div>
        ) : ( */}
        {/* )} */}
      </div>

      {/* Cart Button */}
      {/* <CartButton /> */}
    </div>
  );
}

export default function MenuPage(props: MenuPageProps) {
  return (
    <Suspense fallback={<Loading fullScreen text="Loading menu..." />}>
      <MenuContent {...props} />
    </Suspense>
  );
}
