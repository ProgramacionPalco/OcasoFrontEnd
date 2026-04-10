import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute() {

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {

        const decoded = jwtDecode(token);
        const ahora = Date.now() / 1000;

        if (decoded.exp && decoded.exp < ahora) {
            localStorage.removeItem("token");
            return <Navigate to="/login" replace />;
        }

    } catch {

        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;