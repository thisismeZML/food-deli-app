import { PaginatedDataTable } from "../../datatable/user/paginated-data-table";
import { columns, type User } from "../../datatable/user/columns";

const UserListPage = () => {
  return (
    <div className="container mx-auto py-10">
      <PaginatedDataTable<User, unknown>
        columns={columns}
        endpoint="/user/userlist"
        queryKey={["users", "owners"]}
        initialLimit={10}
        initialSortBy="username"
        initialSortOrder="asc"
        isRole={true}
        createButton={{
          label: "Create User",
          url: "user-create",
        }}
      />
    </div>
  );
};

export default UserListPage;
