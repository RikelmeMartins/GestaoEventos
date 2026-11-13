import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RotaProtegida({ children }) {
    const { usuario, ehOrganizador } = useAuth();
    const location = useLocation();

    if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />
    if (!ehOrganizador) return <Navigate to="/" replace />;
    return children;
}