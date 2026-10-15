import { Outlet } from "react-router-dom";
import { useScrollToHash } from "../../hooks/useScrollToHash.js";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

export default function Layout() {
    useScrollToHash();

    return (
        <>
            <a className="skip-link" href="#contenido">
                Saltar al contenido
            </a>
            <Header />
            <main id="contenido" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
