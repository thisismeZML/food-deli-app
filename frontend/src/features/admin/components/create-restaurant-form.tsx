// CreateRestaurantForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/services/useApiMutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { restaurantCreateSchema, type RestaurantCreateFormData } from "../schema/create-restaurant.schema";
import { getCuisine } from "@/services/restaurant_api/api";

// Service types
const serviceTypes = [
  { id: "dine-in", label: "Dine-in" },
  { id: "takeaway", label: "Takeaway" },
  { id: "delivery", label: "Delivery" },
] as const;

// Price ranges
const priceRanges = [
  { value: 1, label: "$ (Budget)" },
  { value: 2, label: "$$ (Affordable)" },
  { value: 3, label: "$$$ (Moderate)" },
  { value: 4, label: "$$$$ (Expensive)" },
  { value: 5, label: "$$$$$ (Luxury)" },
] as const;

const CreateRestaurantForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");

  // Fetch cuisines
  const { data: cuisines } = getCuisine()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RestaurantCreateFormData>({
    resolver: zodResolver(restaurantCreateSchema),
    defaultValues: {
      name: "",
      location: "",
      phone: "",
      email: "",
      description: "",
      priceRange: 3,
      deliveryFee: 0,
      isOpen: true,
      cuisineIds: [],
      serviceType: ["dine-in"],
      slug: "",
      address: {},
    },
  });

  // Watch values
  const selectedCuisines = watch("cuisineIds");
  const serviceType = watch("serviceType");

  const mutation = useApiMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      navigate("/restaurants");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create restaurant");
    },
  });

  const onSubmit = async (data: RestaurantCreateFormData) => {
    setIsSubmitting(true);
    
    // Prepare data
    const formData = {
      name: data.name,
      location: data.location,
      cuisineIds: data.cuisineIds,
      phone: data.phone,
      email: data.email,
      description: data.description,
      serviceType: data.serviceType,
      priceRange: data.priceRange,
      deliveryFee: data.deliveryFee,
      ...(data.slug && { slug: data.slug }),
    };

    mutation.mutate({
      endpoint: "/restaurant/create",
      method: "POST",
      body: formData,
    });
    
    setIsSubmitting(false);
  };

  const nextTab = () => {
    if (currentTab === "basic") setCurrentTab("services");
    else if (currentTab === "services") setCurrentTab("cuisines");
  };

  const prevTab = () => {
    if (currentTab === "services") setCurrentTab("basic");
    else if (currentTab === "cuisines") setCurrentTab("services");
  };

  return (
    <div className=" bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Restaurant</h1>
          <p className="text-gray-600 mt-2">Add your restaurant to the platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="cuisines">Cuisines</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" {...register("location")} />
                  {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" {...register("phone")} />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priceRange">Price Range *</Label>
                  <Select 
                    onValueChange={(value) => setValue("priceRange", parseInt(value))}
                    defaultValue="3"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value.toString()}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priceRange && <p className="text-red-500 text-sm">{errors.priceRange.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Delivery Fee</Label>
                  <Input 
                    id="deliveryFee"
                    type="number" 
                    min="0" 
                    step="0.01"
                    {...register("deliveryFee", { valueAsNumber: true })} 
                  />
                  {errors.deliveryFee && <p className="text-red-500 text-sm">{errors.deliveryFee.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" {...register("description")} rows={3} />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug (Optional)</Label>
                <Input id="slug" {...register("slug")} />
                <p className="text-sm text-gray-500">Leave empty to auto-generate</p>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">Service Types *</h3>
                  <div className="flex gap-6">
                    {serviceTypes.map((service) => (
                      <div key={service.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={serviceType?.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setValue("serviceType", [...serviceType, service.id]);
                            } else {
                              setValue("serviceType", serviceType?.filter(t => t !== service.id));
                            }
                          }}
                        />
                        <Label htmlFor={`service-${service.id}`}>{service.label}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.serviceType && <p className="text-red-500 text-sm">{errors.serviceType.message}</p>}
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="isOpen"
                      {...register("isOpen")} 
                      defaultChecked 
                    />
                    <div>
                      <Label htmlFor="isOpen">Restaurant is currently open</Label>
                      <p className="text-sm text-gray-500">Uncheck if your restaurant is temporarily closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cuisines" className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Cuisines *</h3>
              {!cuisines || cuisines.length === 0 ? (
                <p className="text-gray-500">Loading cuisines...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cuisines.map((cuisine: any) => (
                    <div key={cuisine._id} className="flex items-center gap-2">
                      <Checkbox
                        id={`cuisine-${cuisine._id}`}
                        checked={selectedCuisines?.includes(cuisine._id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("cuisineIds", [...selectedCuisines, cuisine._id]);
                          } else {
                            setValue("cuisineIds", selectedCuisines?.filter(id => id !== cuisine._id));
                          }
                        }}
                      />
                      <Label htmlFor={`cuisine-${cuisine._id}`}>{cuisine.name}</Label>
                    </div>
                  ))}
                </div>
              )}
              {errors.cuisineIds && <p className="text-red-500 text-sm">{errors.cuisineIds.message}</p>}
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/restaurants")}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {currentTab !== "basic" && (
              <Button
                type="button"
                variant="outline"
                onClick={prevTab}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {currentTab !== "cuisines" ? (
              <Button
                type="button"
                onClick={nextTab}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                {isSubmitting ? "Creating..." : "Create Restaurant"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurantForm;