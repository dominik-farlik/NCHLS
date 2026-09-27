import { Navigate, Outlet, useLocation } from "react-router-dom";
import {useAuth} from "../context/useAuth.ts";
import type {Role} from "../schemas/Role.ts";
import Forbidden from "../pages/Forbidden.tsx";

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[]}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 font-bold">Ověřuji přihlášení...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && allowedRoles && !allowedRoles.includes(user.role.name)) {
        return <Forbidden />;
    }

    return <Outlet />;
}