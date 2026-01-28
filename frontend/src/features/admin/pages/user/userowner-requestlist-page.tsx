import { columns, type Owner } from "../../datatable/owner/columns";
import { PaginatedDataTable } from "../../datatable/user/paginated-data-table";

const UserOwnerRequestList = () => {
  return (
    <div className="container mx-auto py-10">
      <PaginatedDataTable<Owner, unknown>
        columns={columns}
        endpoint="/owner/owner-requests"
        queryKey={["owners", "users"]}
        initialLimit={10}
        initialSortBy="name"
        initialSortOrder="asc"
      />
    </div>
  );
};

export default UserOwnerRequestList;
