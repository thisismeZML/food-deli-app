import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";
import {
  restaurantUpdateSchema,
  type RestaurantUpdateFormData,
} from "@/features/admin/schema/update-restaurant.schema";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { getCuisine } from "@/services/restaurant_api/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// In editRes-button.tsx, update the interface
interface EditProps {
  label: string;
  apiUrl: string;
  queryKey: string[] | string;
  desc?: string;
  id: number | string;
  variant?: "default" | "contextMenu";
  onSuccess?: () => void;
  initialData: {
    // Basic Information
    name: string;
    slug: string;
    location: string;

    // Contact Information
    phone: string;
    email: string;

    // Description
    description: string;

    // Cuisine and Categories
    cuisineIds: string[];
    priceRange: 1 | 2 | 3 | 4 | 5;

    // Service Options
    serviceType: ("dine-in" | "takeaway" | "delivery")[];
    deliveryFee: number;
    isOpen: boolean;

    // Opening Hours
    openingHours: {
      [key: string]: {
        open: string;
        close: string;
        isClosed: boolean;
      };
    };

    // Address
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };

    // Images
    logo?: string;
    coverImage?: string;

    // Status
    status: "pending" | "active" | "suspended" | "closed";
  };
  cuisines: Array<{ _id: string; name: string }>;
}

const daysOfWeek = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const serviceTypes = ["dine-in", "takeaway", "delivery"] as const;
const priceRanges = [1, 2, 3, 4, 5] as const;

export default function EditButton(props: EditProps) {
  const [open, setOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: Cuisines } = getCuisine();

  // In your useForm initialization in editRes-button.tsx
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    trigger,
  } = useForm<RestaurantUpdateFormData>({
    resolver: zodResolver(restaurantUpdateSchema),
    defaultValues: {
      name: props.initialData?.name || "",
      slug: props.initialData?.slug || "",
      location: props.initialData?.location || "",
      phone: props.initialData?.phone || "",
      email: props.initialData?.email || "",
      description: props.initialData?.description || "",
      priceRange: props.initialData?.priceRange || 1,
      deliveryFee: props.initialData?.deliveryFee || 0,
      isOpen: props.initialData?.isOpen || true,
      serviceType: props.initialData?.serviceType || ["dine-in"],
      cuisineIds: props.initialData?.cuisineIds || [], // Use cuisineIds here
      address: props.initialData?.address || {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
      openingHours: props.initialData?.openingHours || {
        monday: { open: "09:00", close: "22:00", isClosed: false },
        tuesday: { open: "09:00", close: "22:00", isClosed: false },
        wednesday: { open: "09:00", close: "22:00", isClosed: false },
        thursday: { open: "09:00", close: "22:00", isClosed: false },
        friday: { open: "09:00", close: "22:00", isClosed: false },
        saturday: { open: "09:00", close: "22:00", isClosed: false },
        sunday: { open: "10:00", close: "20:00", isClosed: false },
      },
      logo: undefined,
      coverImage: undefined,
      status: props.initialData?.status || "pending",
    },
  });

  // Initialize selected values
  useEffect(() => {
    if (props.initialData) {
      // Use cuisineIds from initialData
      setSelectedCuisines(props.initialData.cuisineIds || []);
      setSelectedServices(props.initialData.serviceType || ["dine-in"]);

      // Set image previews if they exist
      if (props.initialData.logo) {
        setLogoPreview(props.initialData.logo);
      }
      if (props.initialData.coverImage) {
        setCoverPreview(props.initialData.coverImage);
      }
    }
  }, [props.initialData]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && props.initialData) {
      reset({
        name: props.initialData.name,
        description: props.initialData.description,
        phone: props.initialData.phone,
        email: props.initialData.email,
        location: props.initialData.location,
        priceRange: props.initialData.priceRange,
        deliveryFee: props.initialData.deliveryFee,
        isOpen: props.initialData.isOpen,
        serviceType: props.initialData.serviceType,
        cuisineIds: props.initialData?.cuisineIds || [],
        address: props.initialData.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        },
        openingHours: props.initialData.openingHours || {
          monday: { open: "09:00", close: "22:00", isClosed: false },
          tuesday: { open: "09:00", close: "22:00", isClosed: false },
          wednesday: { open: "09:00", close: "22:00", isClosed: false },
          thursday: { open: "09:00", close: "22:00", isClosed: false },
          friday: { open: "09:00", close: "22:00", isClosed: false },
          saturday: { open: "09:00", close: "22:00", isClosed: false },
          sunday: { open: "10:00", close: "20:00", isClosed: false },
        },
      });
      setLogoPreview(props.initialData.logo || null);
      setCoverPreview(props.initialData.coverImage || null);
    }
  }, [open, reset, props.initialData]);

  // Handle file uploads
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("logo", file);
      trigger("logo");
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("coverImage", file);
      trigger("coverImage");
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleCuisineToggle = (cuisineId: string) => {
    const newCuisines = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter((id) => id !== cuisineId)
      : [...selectedCuisines, cuisineId];

    setSelectedCuisines(newCuisines);
    setValue("cuisineIds", newCuisines);
    trigger("cuisineIds");
  };

  const handleServiceToggle = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];

    setSelectedServices(newServices);
    setValue("serviceType", newServices as any);
    trigger("serviceType");
  };

  const onSubmit = async (data: RestaurantUpdateFormData) => {
    const formData = new FormData();

    // First, check if data is valid
    if (!data || typeof data !== "object") {
      toast.error("Invalid form data");
      return;
    }

    // Append all fields - FIXED VERSION
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];

      // Skip undefined/null values
      if (value === undefined || value === null) {
        return;
      }

      try {
        if (key === "logo" || key === "coverImage") {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value === "") {
            // If it's an empty string, send it to clear the image
            formData.append(key, "");
          }
        } else if (key === "cuisineIds" || key === "serviceType") {
          if (Array.isArray(value) && value.length > 0) {
            // Append each item separately for arrays
            value.forEach((item) => formData.append(key, item));
          }
        } else if (key === "openingHours" || key === "address") {
          // Stringify object fields
          if (value && typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          // Convert to string for other values
          formData.append(key, String(value));
        }
      } catch (error) {
        console.error(`Error processing field ${key}:`, error);
      }
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${props.apiUrl}/${props.id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Restaurant updated successfully!");
        const queryKey = Array.isArray(props.queryKey)
          ? props.queryKey
          : [props.queryKey];
        queryClient.invalidateQueries({ queryKey });
        setOpen(false);
        reset();
        props.onSuccess?.();
      } else {
        toast.error(result.message || "Failed to update restaurant");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setLogoPreview(null);
    setCoverPreview(null);
    props.onSuccess?.();
  };

  const getOpeningHoursPath = (
    day: string,
    field: "open" | "close" | "isClosed",
  ): keyof RestaurantUpdateFormData => {
    const path = `openingHours.${day}.${field}`;
    return path as keyof RestaurantUpdateFormData;
  };

  const isLoading = isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">
          Edit
          {props.desc && (
            <span className="text-xs text-red-500 dark:text-red-400">
              {props.desc}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full min-w-4xl max-h-[90vh] overflow-y-auto p-0 dark:bg-gray-900">
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <DialogHeader className="text-left">
                <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Restaurant
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Update the restaurant information below
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8">
                {/* Basic Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Restaurant Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Enter restaurant name"
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+1234567890"
                        disabled={isLoading}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="restaurant@example.com"
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="Enter location"
                        disabled={isLoading}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-600">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Describe your restaurant..."
                        rows={4}
                        disabled={isLoading}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Cuisines *</h3>

                  <Controller
                    name="cuisineIds"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {(field.value?.length as number) > 0
                              ? `${field.value?.length} cuisine(s) selected`
                              : "Select cuisines..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search cuisines..." />
                            <CommandEmpty>No cuisine found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {Cuisines?.map((cuisine: any) => (
                                <CommandItem
                                  key={cuisine._id}
                                  onSelect={() => {
                                    const newValue = field.value?.includes(
                                      cuisine._id,
                                    )
                                      ? field.value.filter(
                                          (id) => id !== cuisine._id,
                                        )
                                      : [...(field.value || []), cuisine._id];
                                    field.onChange(newValue);
                                    setSelectedCuisines(newValue);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(cuisine._id)
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {cuisine.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />

                  {/* Show selected cuisines as badges */}
                  {selectedCuisines.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedCuisines.map((cuisineId) => {
                        const cuisine = Cuisines?.find(
                          (c: any) => c._id === cuisineId,
                        );
                        return cuisine ? (
                          <Badge
                            key={cuisineId}
                            variant="default"
                            className="cursor-pointer"
                            onClick={() => handleCuisineToggle(cuisineId)}
                          >
                            {cuisine.name}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {errors.cuisineIds && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors.cuisineIds.message}
                    </p>
                  )}
                </div>

                {/* Service Type - Updated with better UX */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Service Type *</h3>

                  <Controller
                    name="serviceType"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {(field.value?.length as number) > 0
                              ? `${field.value?.length} service type(s) selected`
                              : "Select service types..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search service types..." />
                            <CommandEmpty>No service type found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {serviceTypes.map((service) => (
                                <CommandItem
                                  key={service}
                                  onSelect={() => {
                                    const newValue = field.value?.includes(
                                      service,
                                    )
                                      ? field.value.filter((s) => s !== service)
                                      : [...(field.value || []), service];
                                    field.onChange(newValue);
                                    setSelectedServices(newValue);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value?.includes(service)
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {service.charAt(0).toUpperCase() +
                                    service.slice(1).replace("-", " ")}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />

                  {/* Show selected service types as badges */}
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedServices.map((service) => (
                        <Badge
                          key={service}
                          variant="default"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleServiceToggle(service)}
                        >
                          {service.charAt(0).toUpperCase() +
                            service.slice(1).replace("-", " ")}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Optional: Always show all service types with toggle badges */}
                  {selectedServices.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the dropdown above to select service types
                    </p>
                  )}

                  {errors.serviceType && (
                    <p className="text-sm text-red-600 mt-2">
                      {errors.serviceType.message}
                    </p>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Price Range *</h3>
                  <Controller
                    name="priceRange"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map((price) => (
                            <SelectItem key={price} value={price.toString()}>
                              {"$".repeat(price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.priceRange && (
                    <p className="text-sm text-red-600">
                      {errors.priceRange.message}
                    </p>
                  )}
                </div>

                {/* Delivery Fee */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryFee">Delivery Fee</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("deliveryFee", { valueAsNumber: true })}
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                      {errors.deliveryFee && (
                        <p className="text-sm text-red-600">
                          {errors.deliveryFee.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Opening Hours</h3>
                  <div className="space-y-4">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day.key}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        <div className="md:col-span-2">
                          <Label className="font-medium">{day.label}</Label>
                        </div>
                        <div className="md:col-span-3">
                          <Controller
                            name={getOpeningHoursPath(day.key, "open")}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="time"
                                disabled={isLoading}
                              />
                            )}
                          />
                        </div>
                        <div className="md:col-span-1 text-center">to</div>
                        <div className="md:col-span-3">
                          <Controller
                            name={getOpeningHoursPath(day.key, "close")}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="time"
                                disabled={isLoading}
                              />
                            )}
                          />
                        </div>
                        <div className="md:col-span-3 flex items-center space-x-2">
                          <Controller
                            name={getOpeningHoursPath(day.key, "isClosed")}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            )}
                          />
                          <Label>Closed</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        {...register("address.street")}
                        placeholder="Street address"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("address.city")}
                        placeholder="City"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("address.state")}
                        placeholder="State"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        {...register("address.zipCode")}
                        placeholder="ZIP Code"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...register("address.country")}
                        placeholder="Country"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Logo</Label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label
                          htmlFor="logo-upload"
                          className="cursor-pointer flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Logo</span>
                        </Label>
                        {(logoPreview || props.initialData?.logo) && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border">
                            <img
                              src={
                                logoPreview
                                  ? logoPreview.startsWith("blob:")
                                    ? logoPreview
                                    : `${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${logoPreview}`
                                  : props.initialData?.logo
                                    ? `${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${props.initialData.logo}`
                                    : ""
                              }
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Cover Image</Label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          ref={coverInputRef}
                          onChange={handleCoverChange}
                          className="hidden"
                          id="cover-upload"
                        />
                        <Label
                          htmlFor="cover-upload"
                          className="cursor-pointer flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Cover</span>
                        </Label>
                        {(coverPreview || props.initialData?.coverImage) && (
                          <div className="w-32 h-20 rounded-lg overflow-hidden border">
                            <img
                              src={
                                coverPreview
                                  ? coverPreview.startsWith("blob:")
                                    ? coverPreview
                                    : `${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${coverPreview}`
                                  : props.initialData?.coverImage
                                    ? `${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${props.initialData.coverImage}`
                                    : ""
                              }
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-8">
                  <div className="flex items-center space-x-4">
                    <Controller
                      name="isOpen"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      )}
                    />
                    <Label className="text-lg">Restaurant is Open</Label>
                  </div>
                </div>

                {/* Form Actions */}
                <DialogFooter className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        "Update Restaurant"
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
