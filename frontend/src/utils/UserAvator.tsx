import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  photo?: string;
  username: string;
  className?: string;
}

const getColorFromName = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

export function UserAvatar({
  photo,
  username,
  className = "",
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <Avatar className={`h-8 w-8 ${className}`}>
      {photo ? (
        <AvatarImage src={`${import.meta.env.VITE_IMAGE_UPLOAD_URL}/${photo}`} alt={username} className="object-cover" />
      ) : (
        <AvatarFallback className={getColorFromName(username)}>
          <span className="text-white">{getInitials(username)}</span>
        </AvatarFallback>
      )}
    </Avatar>
  );
}
