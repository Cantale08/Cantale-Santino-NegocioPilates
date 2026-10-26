import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import EmptyState from "../ui/EmptyState.jsx";
import LoadingState from "../ui/LoadingState.jsx";
import Button from "../ui/Button.jsx";

export default function ProtectedRoute({ roles }) {
    const { usuario, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="container section">
                <LoadingState label="Verificando sesión..." />
            </div>
        );
    }
    if (!usuario) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (roles && !roles.includes(usuario.rol)) {
        return (
            <div className="container section">
                <EmptyState title="No tenés permisos para ver esta página">
                    <Button to="/" variant="secondary" size="sm">
                        Volver al inicio
                    </Button>
                </EmptyState>
            </div>
        );
    }
    return <Outlet />;
}
