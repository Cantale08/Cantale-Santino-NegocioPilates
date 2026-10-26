import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Layout from "./components/layout/Layout.jsx";
import AdminClasesPage from "./pages/AdminClasesPage.jsx";
import AdminTurnosPage from "./pages/AdminTurnosPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MisTurnosPage from "./pages/MisTurnosPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ReservarPage from "./pages/ReservarPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="reservar" element={<ReservarPage />} />
                <Route element={<ProtectedRoute roles={["cliente"]} />}>
                    <Route path="mis-turnos" element={<MisTurnosPage />} />
                </Route>
                <Route element={<ProtectedRoute roles={["administrador"]} />}>
                    <Route path="admin/clases" element={<AdminClasesPage />} />
                    <Route path="admin/turnos" element={<AdminTurnosPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
