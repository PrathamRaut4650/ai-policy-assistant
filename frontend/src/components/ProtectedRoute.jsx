import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Not logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Wrong role
    if (allowedRole && user.role !== allowedRole) {
        if (user.role === "hr") {
            return <Navigate to="/hr-dashboard" replace />;
        }

        if (user.role === "employee") {
            return <Navigate to="/employee-dashboard" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;