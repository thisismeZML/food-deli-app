import { useQuery } from "@tanstack/react-query";
import api from "./Provider";

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
  message: string;
}

export const fetchDataList = async <T>(
  endpoint: string,
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "username",
  order: "asc" | "desc" = "asc",
  filters: Record<string, any> = {}
): Promise<PaginatedResponse<T>> => {
  const params = {
    page,
    limit,
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    order,
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v != null && v !== "" && v !== "all")
    ),
  };

  const res = await api.get(endpoint, { params });
  return res.data;
};

export const usePaginatedQuery = <T>(
  endpoint: string,
  queryKey: string[],
  page: number,
  limit: number,
  search: string = "",
  sortBy: string = "username",
  order: "asc" | "desc" = "asc",
  filters: Record<string, any> = {}
) => {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [...queryKey, page, limit, search, sortBy, order, filters],
    queryFn: () =>
      fetchDataList<T>(endpoint, page, limit, search, sortBy, order, filters),
    staleTime: 5 * 60 * 1000, 
  });
};
