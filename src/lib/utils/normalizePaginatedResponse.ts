import { PaginatedResponse } from "../types/common";

export function normalizePaginatedResponse<T>(raw: any): PaginatedResponse<T> {
  const key = Object.keys(raw).find((k) => Array.isArray(raw[k]));

  if (!key) {
    throw new Error("Invalid paginated response shape");
  }

  return {
    payload: raw[key],
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
  };
}
