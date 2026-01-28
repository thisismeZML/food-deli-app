import { columns, type Restaurant } from "../../datatable/restaurant/columns";
import { RestaurantPaginatedDataTable } from "../../datatable/restaurant/restaurant-paginated-data-table";

const RestaurantListPage = () => {
  return (
    <div className="container mx-auto py-10">
      <RestaurantPaginatedDataTable<Restaurant, unknown>
        columns={columns}
        endpoint="/restaurant/list"
        queryKey={["restaurants"]}
        initialLimit={10}
        initialSortBy="name"
        initialSortOrder="asc"
      />
    </div>
  );
};

export default RestaurantListPage;
