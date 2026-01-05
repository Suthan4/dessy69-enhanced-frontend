const LIST_KEYS = [
  "items",
  "orders",
  "products",
  "users",
  "categories",
  "coupons",
  "reviews",
];

export function normalizePaginatedResponse<T>(apiResponse: any): {
  items: T[];
  total: number;
} {
  // Support ApiResponse wrapper
  const data = apiResponse?.data ?? apiResponse;

  const listKey = LIST_KEYS.find((key) => Array.isArray(data?.[key]));

  if (!listKey) {
    console.error(
      "Invalid paginated response, keys found:",
      Object.keys(data),
      apiResponse
    );
    return { items: [], total: 0 };
  }

  return {
    items: data[listKey],
    total: typeof data.total === "number" ? data.total : 0,
  };
}
