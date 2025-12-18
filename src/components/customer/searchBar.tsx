"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const runSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    router.push(`/menu?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    // clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    // set new debounce
    debounceRef.current = setTimeout(() => {
      runSearch(value);
    });
  };

  const handleClear = () => {
    setQuery("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`/menu?${params.toString()}`);
  };
  // clear on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search ice creams, shakes, snacks..."
        className={cn(
          "w-full pl-12 pr-12 py-3 sm:py-4",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "rounded-full",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500",
          "transition-all duration-200"
        )}
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      )}
    </div>
  );
};
