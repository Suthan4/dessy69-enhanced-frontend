"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/lib/types/category";
import { cn } from "@/lib/utils/cn";

interface CategoryFilterProps {
  categories: any;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const handleCategoryClick = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    router.push(`/menu?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            !selectedCategory
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          All Items
        </button>
        {categories?.data
          .filter((cat:Category) => cat.level === 0)
          .map((category:Category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {category.name}
            </button>
          ))}
      </div>
    </div>
  );
};
