import { useState } from "react";
import { RestaurantDataTable } from "./restaurant-data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { usePaginatedQuery } from "@/services/usePaginatedQuery";

interface RestaurantPaginatedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  endpoint: string;
  queryKey: string[];
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  initialFilters?: Record<string, any>;

  createButton?: {
    label?: string;
    url: string;
    onClick?: () => void;
    show?: boolean;
  };
}

export function RestaurantPaginatedDataTable<TData, TValue>({
  columns,
  endpoint,
  queryKey,
  initialPage = 1,
  initialLimit = 10,
  initialSearch = "",
  initialSortBy = "name",
  initialSortOrder = "asc",
  initialFilters = {},

  createButton,
}: RestaurantPaginatedDataTableProps<TData, TValue>) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading } = usePaginatedQuery<TData>(
    endpoint,
    queryKey,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters
  );

  return (
    <RestaurantDataTable<TData, TValue>
      columns={columns}
      data={data?.data || []}
      total={data?.pagination?.total || 0}
      page={data?.pagination?.page || page}
      limit={data?.pagination?.limit || limit}
      totalPages={data?.pagination?.totalPages || 1}
      onPageChange={setPage}
      onLimitChange={(newLimit) => {
        setLimit(newLimit);
        setPage(1);
      }}
      onSortChange={(newSortBy, newOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newOrder);
        setPage(1);
      }}
      onSearchChange={(newSearch) => {
        setSearch(newSearch);
        setPage(1);
      }}
      onFilterChange={(newFilters) => {
        setFilters(newFilters);
        setPage(1);
      }}
      loading={isLoading}
      createButton={createButton}
    />
  );
}
