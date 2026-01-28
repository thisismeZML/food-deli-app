import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { useState } from "react";
import { Label } from "./label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  Truck, 
  UtensilsCrossed,
  Check,
  X,
  Building,
  Globe,
  FileText,
  Star,
  Users,
  Eye,
  Calendar,
  Tag
} from "lucide-react";

interface ViewProps {
  label?: string;
  id: number | string;
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
    cuisine?: Array<{_id: string; name: string}>;
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
        _id?: string;
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
    logo?: string | null;
    coverImage?: string | null;

    // Status
    status: "pending" | "active" | "suspended" | "closed";
    
    // Additional from your Restaurant type
    owner?: {
      _id: string;
      username: string;
      email: string;
      photo: string | null;
    };
    rating?: number;
    totalReviews?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  variant?: "view" | "default";
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

export default function ViewButton(props: ViewProps) {
  const [open, setOpen] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    if (time.length === 5) return time; // Already in HH:MM format
    
    // Convert "9:00" to "09:00"
    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return time;
  };

  const getDayStatus = (hours: { isClosed: boolean; open: string; close: string }) => {
    if (hours.isClosed) return "Closed";
    const openTime = formatTime(hours.open);
    const closeTime = formatTime(hours.close);
    return `${openTime} - ${closeTime}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" }> = {
      pending: { label: "Pending", variant: "outline" },
      active: { label: "Active", variant: "success" },
      suspended: { label: "Suspended", variant: "destructive" },
      closed: { label: "Closed", variant: "secondary" },
    };
    
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPriceRangeDisplay = (priceRange: number) => {
    return "$".repeat(priceRange);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Button
        variant="view"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="py-6 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <DialogHeader className="text-left">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {props.initialData?.logo && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100">
                          <img
                            src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${props.initialData.logo}`}
                            alt="Restaurant logo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-semibold">${props.initialData.name?.charAt(0).toUpperCase() || 'R'}</div>`;
                              }
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                          {props.initialData?.name || "Restaurant Details"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {props.initialData?.slug || "No slug"}
                            </span>
                            {getStatusBadge(props.initialData?.status || "pending")}
                            <Badge variant={props.initialData?.isOpen ? "success" : "destructive"}>
                              {props.initialData?.isOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Cover Image */}
              {props.initialData?.coverImage && (
                <div className="mb-6 rounded-xl overflow-hidden border">
                  <img
                    src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${props.initialData.coverImage}`}
                    alt="Restaurant cover"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 space-y-6">
                {/* Owner Information */}
                {props.initialData?.owner && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Owner Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500 dark:text-gray-400">Username</Label>
                        <div className="font-medium">{props.initialData.owner.username || "N/A"}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500 dark:text-gray-400">Email</Label>
                        <div className="font-medium">{props.initialData.owner.email || "N/A"}</div>
                      </div>
                      {props.initialData.owner.photo && (
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-500 dark:text-gray-400">Photo</Label>
                          <div className="w-12 h-12 rounded-full overflow-hidden border">
                            <img
                              src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${props.initialData.owner.photo}`}
                              alt="Owner photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rating & Reviews */}
                {(props.initialData?.rating !== undefined || props.initialData?.totalReviews !== undefined) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Ratings & Reviews
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500 dark:text-gray-400">Average Rating</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{props.initialData.rating?.toFixed(1) || "0.0"}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (props.initialData.rating || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</Label>
                        <div className="text-2xl font-bold">{props.initialData.totalReviews || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Restaurant Name</Label>
                      <div className="font-medium">{props.initialData?.name || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      <div className="font-medium">{props.initialData?.location || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <div className="font-medium">{props.initialData?.phone || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <div className="font-medium">{props.initialData?.email || "N/A"}</div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        Description
                      </Label>
                      <div className="font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-3">
                        {props.initialData?.description || "No description provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuisines */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Cuisines
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {props.initialData?.cuisine && props.initialData.cuisine.length > 0 ? (
                      props.initialData.cuisine.map((cuisine) => (
                        <Badge key={cuisine._id} variant="secondary" className="text-sm px-3 py-1">
                          {cuisine.name}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 italic">No cuisines selected</div>
                    )}
                  </div>
                </div>

                {/* Service Type & Price Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Service Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {props.initialData?.serviceType?.length > 0 ? (
                        props.initialData.serviceType.map((service) => (
                          <Badge key={service} variant="default" className="text-sm px-3 py-1">
                            {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " ")}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">No service types selected</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Price Range
                    </h3>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {getPriceRangeDisplay(props.initialData?.priceRange || 1)}
                      <span className="text-sm font-normal text-gray-500">({props.initialData?.priceRange || 1}/5)</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Fee */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Information
                  </h3>
                  <div className="text-2xl font-bold">
                    ${(props.initialData?.deliveryFee || 0).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500 ml-2">delivery fee</span>
                  </div>
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Opening Hours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {daysOfWeek.map((day) => {
                      const hours = props.initialData?.openingHours?.[day.key];
                      return (
                        <div
                          key={day.key}
                          className={`p-3 rounded-lg border ${hours?.isClosed ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{day.label}</span>
                            {hours?.isClosed ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className={`text-sm ${hours?.isClosed ? "text-red-500 italic" : "text-gray-700 dark:text-gray-300"}`}>
                            {hours ? getDayStatus(hours) : "Not Set"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Street</Label>
                      <div className="font-medium">{props.initialData?.address?.street || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">City</Label>
                      <div className="font-medium">{props.initialData?.address?.city || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">State</Label>
                      <div className="font-medium">{props.initialData?.address?.state || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">ZIP Code</Label>
                      <div className="font-medium">{props.initialData?.address?.zipCode || "N/A"}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-500 dark:text-gray-400">Country</Label>
                      <div className="font-medium">{props.initialData?.address?.country || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Created At
                    </h3>
                    <div className="font-medium">{formatDate(props.initialData?.createdAt)}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Last Updated
                    </h3>
                    <div className="font-medium">{formatDate(props.initialData?.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}