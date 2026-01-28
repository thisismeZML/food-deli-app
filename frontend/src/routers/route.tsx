import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicRoute from "./publicRoute";
import AuthLayout from "@/Layout/AuthLayout";
import SignupPage from "@/features/auth/pages/SignupPage";
import SigninPage from "@/features/auth/pages/SigninPage";
import ForgetPasswordPage from "@/features/auth/pages/ForgetPasswordPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ProtectedRoute from "./protectedRoute";
import HomeLayout from "@/Layout/HomeLayout";
import AdminLayout from "@/Layout/AdminLayout";
import DashboardPage from "@/features/admin/pages/dashboard-page";
import UserListPage from "@/features/admin/pages/user/userlist-page";
import OrderListPage from "@/features/admin/pages/orderlist-page";
import RestaurantListPage from "@/features/admin/pages/restaurant/restaurantlist-page";
import FoodListPage from "@/features/admin/pages/foodlist-page";
import CategoryListPage from "@/features/admin/pages/categorylist-page";
import CreateUserPage from "@/features/admin/pages/user/create-user-page";
import EditUserPage from "@/features/admin/pages/user/edit-user-page";
import UserOwnerRequestList from "@/features/admin/pages/user/userowner-requestlist-page";
import CreateRequestRestaurantPage from "@/features/admin/pages/restaurant/create-request-restaurant-page";
import UpdateRequestRestaurantPage from "@/features/admin/pages/restaurant/update-request-restaurant-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />,
  },
  {
    path: "/",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "signin",
        element: <SigninPage />,
      },
      {
        path: "forget-password",
        element: <ForgetPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRole={["admin", "customer"]}>
        <HomeLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "restaurants",
        element: <div>Restaurant List Page</div>,
      },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRole={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "user-list",
        element: <UserListPage />,
      },
      {
        path: "user-list/user-create",
        element: <CreateUserPage />,
      },
      {
        path: "user-edit/:id",
        element: <EditUserPage />,
      },
      {
        path: "user-owner-requests",
        element: <UserOwnerRequestList />,
      },
      {
        path: "order-list",
        element: <OrderListPage />,
      },
      {
        path: "restaurant-list",
        element: <RestaurantListPage />,
      },
      {
        path: "restaurant-create-request",
        element: <CreateRequestRestaurantPage />,
      },
      {
        path: "restaurant-update-request",
        element: <UpdateRequestRestaurantPage />,
      },
      {
        path: "food-list",
        element: <FoodListPage />,
      },
      {
        path: "category-list",
        element: <CategoryListPage />,
      },
    ],
  },
]);

export default router;
