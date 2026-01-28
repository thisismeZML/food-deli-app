import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "@/stores/user.store";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useUserStore();

  const userpath = user?.role;

  if (user?.token || (user && userpath === "admin")) {
    return <Navigate to="/dashboard" replace />;
  } else if (user?.token || (user && userpath === "customer")) {
    return <Navigate to="/restaurants" replace />;
  }

  return children;
};

export default PublicRoute;
