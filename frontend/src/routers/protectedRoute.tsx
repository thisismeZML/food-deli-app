import { Navigate } from "react-router-dom";
import { type JSX } from "react";
import Cookies from "js-cookie";
import { useUserStore } from "@/stores/user.store";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRole: string[];
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { token, role } = useUserStore();

  const authToken = Cookies.get("food_deli_token") || token;

  if (!authToken) {
    return <Navigate to="/signin" replace />;
  }

  const currentUserRole = role;

  if (currentUserRole && !allowedRole.includes(currentUserRole)) {
    toast.warning(`Access denied for role: ${currentUserRole}`);
    const targetPath =
      currentUserRole === "admin" ? "/dashboard" : "/restaurants";
    return <Navigate to={targetPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
