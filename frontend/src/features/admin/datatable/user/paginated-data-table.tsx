// paginated-data-table.tsx
import { useState } from "react";
import { DataTable } from "./data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { usePaginatedQuery } from "@/services/usePaginatedQuery";

interface PaginatedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  endpoint: string;
  queryKey: string[];
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  initialFilters?: Record<string, any>;
  isRole?: boolean;
  createButton?: {
    label?: string;
    url: string; // Dynamic URL for create page
    onClick?: () => void; // Optional custom click handler
    show?: boolean; // Show/hide the button
  };
}

export function PaginatedDataTable<TData, TValue>({
  columns,
  endpoint,
  queryKey,
  initialPage = 1,
  initialLimit = 10,
  initialSearch = "",
  initialSortBy = "createdAt",
  initialSortOrder = "desc",
  initialFilters = {},
  isRole = false,
  createButton,
}: PaginatedDataTableProps<TData, TValue>) {
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
    filters,
  );

  return (
    <DataTable<TData, TValue>
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
      isRole={isRole}
      createButton={createButton}
    />
  );
}
