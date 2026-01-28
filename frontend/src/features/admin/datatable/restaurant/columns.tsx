import DeleteButton from "@/components/ui/delete-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type ColumnDef } from "@tanstack/react-table";
import EditButton from "@/components/ui/editRes-button";
import ViewButton from "@/components/ui/viewRes-button"; // Add this import

export type Restaurant = {
  _id: string | number;
  owner: {
    _id: string;
    username: string;
    email: string;
    photo: string | null;
  };
  slug: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  cuisine: Array<{
    _id: string;
    name: string;
  }>;
  priceRange: 1 | 2 | 3 | 4 | 5;
  description: string;
  logo: string | null;
  coverImage: string | null;
  serviceType: ("dine-in" | "takeaway" | "delivery")[];
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
      isClosed: boolean;
      _id: string;
    };
  };
  deliveryFee: number;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  status: "pending" | "active" | "suspended" | "closed";
  createdAt: string;
  updatedAt: string;
  currentStatus?: "open" | "closed";
};

// Color mapping for cuisine badges
const cuisineColors: Record<string, string> = {
  "Italian": "bg-blue-500 text-white",
  "Mexican": "bg-green-500 text-white",
  "Chinese": "bg-red-500 text-white",
  "Japanese": "bg-rose-500 text-white",
  "Indian": "bg-orange-500 text-white",
  "Thai": "bg-purple-500 text-white",
  "American": "bg-indigo-500 text-white",
  "French": "bg-pink-500 text-white",
  "Mediterranean": "bg-cyan-500 text-white",
  "Korean": "bg-yellow-500 text-black",
  "Vietnamese": "bg-lime-500 text-black",
  "Spanish": "bg-amber-500 text-black",
};

// Function to get cuisine badge color
const getCuisineColor = (cuisineName: string) => {
  return cuisineColors[cuisineName] || "bg-gray-500 text-white";
};

export const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: "name",
    header: "Restaurant",
    cell: ({ row }) => {
      const restaurant = row.original;
      console.log(restaurant.logo);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${restaurant.logo}` || ""} alt={restaurant.name} />
            <AvatarFallback className="bg-primary/10">
              {restaurant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{restaurant.name}</span>
            <span className="text-sm text-muted-foreground">
              {restaurant.address.city}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.original.owner;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{owner.username}</span>
          <span className="text-sm text-muted-foreground truncate max-w-37.5">
            {owner.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const { phone, email } = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm">{phone}</span>
          <span className="text-sm text-muted-foreground truncate max-w-50">
            {email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cuisine",
    header: "Cuisine",
    cell: ({ row }) => {
      const cuisines = row.original.cuisine;
      return (
        <div className="flex flex-wrap gap-1 max-w-37.5">
          {cuisines.slice(0, 2).map((cuisine) => (
            <div
              key={cuisine._id}
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCuisineColor(cuisine.name)}`}
            >
              {cuisine.name}
            </div>
          ))}
          {cuisines.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{cuisines.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status, currentStatus } = row.original;

      // Status badge
      const getStatusBadge = () => {
        switch (status) {
          case "pending":
            return <Badge variant="outline" className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">Pending</Badge>;
          case "active":
            return <Badge variant="default">Active</Badge>;
          case "suspended":
            return <Badge variant="destructive">Suspended</Badge>;
          case "closed":
            return <Badge variant="outline">Closed</Badge>;
          default:
            return <Badge variant="outline">{String(status)}</Badge>;
        }
      };

      // Open/closed badge
      const getOpenBadge = () => {
        if (currentStatus === "open") {
          return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Open</Badge>;
        } else {
          return <Badge variant="outline">Closed</Badge>;
        }
      };

      return (
        <div className="flex flex-col gap-1">
          {getStatusBadge()}
          {getOpenBadge()}
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating/Price",
    cell: ({ row }) => {
      const { rating, totalReviews, priceRange } = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">{rating.toFixed(1)}</span>
            {totalReviews > 0 && (
              <span className="text-xs text-muted-foreground">
                ({totalReviews})
              </span>
            )}
          </div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-xs ${
                  i < priceRange ? "text-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                $
              </span>
            ))}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const restaurant = row.original;

      // Prepare opening hours data
      const openingHoursData = restaurant.openingHours || {
        monday: { open: "09:00", close: "22:00", isClosed: false },
        tuesday: { open: "09:00", close: "22:00", isClosed: false },
        wednesday: { open: "09:00", close: "22:00", isClosed: false },
        thursday: { open: "09:00", close: "22:00", isClosed: false },
        friday: { open: "09:00", close: "22:00", isClosed: false },
        saturday: { open: "09:00", close: "22:00", isClosed: false },
        sunday: { open: "10:00", close: "20:00", isClosed: false },
      };

      return (
        <div className="flex items-center gap-2">
          {/* View Button */}
          <ViewButton
            variant="view"
            id={restaurant._id}
            initialData={{
              // Basic Information
              name: restaurant.name,
              slug: restaurant.slug,
              location: restaurant.location,

              // Contact Information
              phone: restaurant.phone,
              email: restaurant.email,

              // Description
              description: restaurant.description,

              // Cuisine and Categories
              cuisineIds: restaurant.cuisine.map(c => c._id),
              cuisine: restaurant.cuisine,
              priceRange: restaurant.priceRange,

              // Service Options
              serviceType: restaurant.serviceType,
              deliveryFee: restaurant.deliveryFee,
              isOpen: restaurant.isOpen,

              // Opening Hours
              openingHours: openingHoursData,

              // Address
              address: restaurant.address || {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
              },

              // Images
              logo: restaurant.logo || undefined,
              coverImage: restaurant.coverImage || undefined,

              // Status
              status: restaurant.status,

              // Additional Information
              owner: restaurant.owner,
              rating: restaurant.rating,
              totalReviews: restaurant.totalReviews,
              createdAt: restaurant.createdAt,
              updatedAt: restaurant.updatedAt,
            }}
          />

          {/* Edit Button */}
          <EditButton
            apiUrl="/restaurant/update"
            queryKey="restaurants"
            label="Restaurant"
            id={restaurant._id}
            initialData={{
              // Basic Information
              name: restaurant.name,
              slug: restaurant.slug,
              location: restaurant.location,

              // Contact Information
              phone: restaurant.phone,
              email: restaurant.email,

              // Description
              description: restaurant.description,

              // Cuisine and Categories
              cuisineIds: restaurant.cuisine.map(c => c._id),
              priceRange: restaurant.priceRange,

              // Service Options
              serviceType: restaurant.serviceType,
              deliveryFee: restaurant.deliveryFee,
              isOpen: restaurant.isOpen,

              // Opening Hours
              openingHours: openingHoursData,

              // Address
              address: restaurant.address || {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
              },

              // Images
              logo: restaurant.logo || undefined,
              coverImage: restaurant.coverImage || undefined,

              // Status
              status: restaurant.status,
            }}
            cuisines={restaurant.cuisine} // Pass cuisines for selection
          />
          
          {/* Delete Button */}
          <DeleteButton
            apiUrl="/restaurant/delete"
            queryKey="restaurants"
            label="restaurant"
            id={restaurant._id}
          />
        </div>
      );
    },
  },
];