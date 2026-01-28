import DeleteButton from "@/components/ui/delete-button";
import EditButton from "@/components/ui/edit-button";
import { UserAvatar } from "@/utils/UserAvator";
import { type ColumnDef } from "@tanstack/react-table";
export type User = {
  _id: string | number;
  username: string;
  email: string;
  role: "admin" | "customer" | "owner";
  photo: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "photo",
    header: "Photo",
    cell: ({ row }) => {
      const { photo, username } = row.original;
      return <UserAvatar photo={photo} username={username} />;
    },
  },
  {
    accessorKey: "username",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-5">
          <EditButton
            apiUrl="/user/update"
            queryKey="users"
            label="User"
            id={user._id}
            initialData={{
              username: user.username,
              email: user.email,
              role: user.role,
              photo: user.photo,
            }}
          />
          <DeleteButton
            apiUrl="/user/delete"
            queryKey="users"
            label="user"
            id={user._id}
          />
        </div>
      );
    },
  }
];
