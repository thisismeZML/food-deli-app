// components/ui/restaurant-data-table.tsx
"use client";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Plus,
  Filter,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface RestaurantDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sortBy: string, order: "asc" | "desc") => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  loading?: boolean;

  createButton?: {
    label?: string;
    url: string;
    onClick?: () => void;
    show?: boolean;
  };
}

export function RestaurantDataTable<TData, TValue>({
  columns,
  data,
  total = 1,
  page = 1,
  limit = 5,
  totalPages,
  onPageChange,
  onLimitChange,
  onSortChange,
  onSearchChange,
  onFilterChange,
  loading = false,

  createButton,
}: RestaurantDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Restaurant-specific filter states
  const [serviceType, setServiceType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [isOpen, setIsOpen] = useState<string>("all");
  const [location, setLocation] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [maxRating, setMaxRating] = useState<string>("");
  const [cuisine, setCuisine] = useState<string>("");
  const [hasDelivery, setHasDelivery] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  // Track filter changes
  const [filters, setFilters] = useState<Record<string, any>>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualSorting: true,
  });

  // Handle sorting changes
  useEffect(() => {
    if (sorting.length > 0) {
      const sort = sorting[0];
      onSortChange(sort.id, sort.desc ? "desc" : "asc");
    }
  }, [sorting]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(globalFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Apply filters immediately when they change
  useEffect(() => {
    applyFilters();
  }, [
    serviceType,
    priceRange,
    isOpen,
    location,
    minRating,
    maxRating,
    cuisine,
    hasDelivery,
    status,
  ]);

  // Apply filters
  const applyFilters = () => {
    const newFilters: Record<string, any> = {};

    if (serviceType && serviceType !== "all")
      newFilters.serviceType = serviceType;
    if (priceRange && priceRange !== "all") newFilters.priceRange = priceRange;
    if (isOpen && isOpen !== "all") newFilters.isOpen = isOpen;
    if (location) newFilters.location = location;
    if (minRating) newFilters.minRating = minRating;
    if (maxRating) newFilters.maxRating = maxRating;
    if (cuisine) newFilters.cuisineId = cuisine;
    if (hasDelivery && hasDelivery !== "all")
      newFilters.hasDelivery = hasDelivery;
    if (status && status !== "all") newFilters.status = status;

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Update the clearFilters function
  const clearFilters = () => {
    setServiceType("all");
    setPriceRange("all");
    setIsOpen("all");
    setLocation("");
    setMinRating("");
    setMaxRating("");
    setCuisine("");
    setHasDelivery("all");
    setStatus("all");

    // Clear the filters immediately
    setFilters({});
    onFilterChange({});
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key] !== undefined && filters[key] !== "",
  ).length;

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const handleCreateClick = () => {
  if (createButton?.onClick) {
    createButton.onClick();
  } else if (createButton?.url) {
    // Use the URL from props, not a hardcoded one
    navigate(createButton.url);
  }
};

  return (
    <div className="space-y-4">
      {/* Search and Main Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Limit Selector and Create Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {createButton?.show !== false && createButton?.url && (
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createButton.label }
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Advanced Filters</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Service Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="dine-in">Dine-in</SelectItem>
                  <SelectItem value="takeaway">Takeaway</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="1">$ (Budget)</SelectItem>
                  <SelectItem value="2">$$ (Affordable)</SelectItem>
                  <SelectItem value="3">$$$ (Moderate)</SelectItem>
                  <SelectItem value="4">$$$$ (Expensive)</SelectItem>
                  <SelectItem value="5">$$$$$ (Luxury)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Open Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Currently Open</label>
              <Select value={isOpen} onValueChange={setIsOpen}>
                <SelectTrigger>
                  <SelectValue placeholder="Open status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="true">Open Now</SelectItem>
                  <SelectItem value="false">Closed Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="City name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Rating Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating Range</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                />
                <Input
                  placeholder="Max"
                  value={maxRating}
                  onChange={(e) => setMaxRating(e.target.value)}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            {/* Delivery Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery</label>
              <Select value={hasDelivery} onValueChange={setHasDelivery}>
                <SelectTrigger>
                  <SelectValue placeholder="Delivery option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="true">With Delivery</SelectItem>
                  <SelectItem value="false">No Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuisine</label>
              <Input
                placeholder="Cuisine name or ID"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-gray-300">
        <Table>
          <TableHeader className="text-black">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="border-gray-300 text-black hover:bg-gray-100"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <TableHead className="text-black" key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {isSortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => header.column.toggleSorting()}
                            >
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="hover:bg-gray-200"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No restaurants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "accent" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
