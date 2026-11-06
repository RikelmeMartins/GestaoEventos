import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RotaProtegida({ children }) {
    const { usuario, ehOrganizador } = useAuth();

    if (!usuario) return <Navigate to="/login" replace />;
    if (!ehOrganizador) return <Navigate to="/" replace />;
    return children;
}