import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import AdminClasesPage from "./pages/AdminClasesPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="admin/clases" element={<AdminClasesPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
