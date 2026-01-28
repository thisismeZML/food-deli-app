import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./input";
import { Label } from "./label";
import { userUpdateSchema, type UserUpdateFormData } from "@/features/admin/schema/update-user.schema";
import { useUserStore } from "@/stores/user.store";

interface EditProps {
  label: string;
  apiUrl: string;
  queryKey: string[] | string;
  desc?: string;
  id: number | string;
  variant?: "default" | "contextMenu";
  onSuccess?: () => void;
  initialData?: {
    username: string;
    email: string;
    role: "customer" | "admin" | "owner";
    photo?: string;
  };
}

export default function EditButton(props: EditProps) {
  const [open, setOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [shouldClearPhoto, setShouldClearPhoto] = useState(false); // New state for tracking clear photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {setUser} = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      username: props.initialData?.username || "",
      email: props.initialData?.email || "",
      role: props.initialData?.role || "customer",
      photo: undefined,
    },
  });

  const photoFile = watch("photo");
  const currentPhoto = props.initialData?.photo;

  // Handle file change for preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("photo", file);
      trigger("photo");
      setShouldClearPhoto(false); // Reset clear photo flag when new file is selected

      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } else {
      setValue("photo", undefined);
      setPhotoPreview(null);
    }
  };

  // Handle clear photo
  const handleClearPhoto = () => {
    setShouldClearPhoto(true);
    setPhotoPreview(null);
    setValue("photo", undefined);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        username: props.initialData?.username || "",
        email: props.initialData?.email || "",
        role: props.initialData?.role || "customer",
        photo: undefined,
      });
      setPhotoPreview(null);
      setShouldClearPhoto(false); // Reset clear photo flag
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, reset, props.initialData]);

  const onSubmit = async (data: UserUpdateFormData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("role", data.role);

    if (data.photo instanceof File) {
      formData.append("photo", data.photo);
    } else if (shouldClearPhoto) {
      // Send empty string to clear the photo
      formData.append("photo", "");
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${props.apiUrl}/${props.id}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("User updated successfully!");
        const queryKey = Array.isArray(props.queryKey)
          ? props.queryKey
          : [props.queryKey];
        queryClient.invalidateQueries({ queryKey });
        setOpen(false);
        reset();
        setPhotoPreview(null);
        setShouldClearPhoto(false); // Reset clear photo flag
        setUser(result.data);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        props.onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPhotoPreview(null);
    setShouldClearPhoto(false); // Reset clear photo flag
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    props.onSuccess?.();
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

      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-0 dark:bg-gray-900">
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <DialogHeader className="text-left">
                <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Edit User
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  Update the user information below
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl  p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Username *
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      {...register("username")}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="johndoe"
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Role *
                    </Label>
                    <select
                      id="role"
                      {...register("role")}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isLoading}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                  {/* Photo Upload */}
                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="photo"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Profile Photo
                    </Label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label
                          htmlFor="photo"
                          className="cursor-pointer inline-flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 bg-white dark:bg-gray-800"
                        >
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {photoFile ? "Change Photo" : "Upload Photo"}
                          </span>
                        </label>
                        <input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />

                        {/* Clear Photo Button - only show if there's a current photo */}
                        {currentPhoto && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearPhoto}
                            disabled={isLoading || shouldClearPhoto}
                            className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {shouldClearPhoto ? "Photo will be cleared" : "Clear Photo"}
                          </Button>
                        )}

                        {photoFile && !shouldClearPhoto && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {typeof photoFile === "string"
                              ? photoFile
                              : photoFile?.name}
                          </span>
                        )}
                      </div>

                      {/* Photo Preview */}
                      {photoPreview && !shouldClearPhoto && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preview:
                          </p>
                          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Current Photo */}
                      {currentPhoto && !photoPreview && !shouldClearPhoto && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Photo:
                          </p>
                          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}${currentPhoto}`}
                              alt="Current"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Upload a new photo to replace this one
                          </p>
                        </div>
                      )}

                      {/* Message when photo is cleared */}
                      {shouldClearPhoto && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Profile photo will be cleared when you update the user.
                          </p>
                        </div>
                      )}

                      {errors.photo && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {errors.photo.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <DialogFooter className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end space-x-4 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 bg-white dark:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        "Update User"
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
