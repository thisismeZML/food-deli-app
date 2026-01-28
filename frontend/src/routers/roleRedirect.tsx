import { useUserStore } from "@/stores/user.store";
import { Navigate } from "react-router-dom";

const RoleRedirect = () => {
    const { role } = useUserStore();

    const adminpath = "/dashboard";
    const userpath = "/restaurants";

    if (role === "admin") {
        return <Navigate to={adminpath} replace />;
    } else if (role === "user") {
        return <Navigate to={userpath} replace />;
    } else {
        return <Navigate to="/signin" replace />;
    }
}

export default RoleRedirect;
