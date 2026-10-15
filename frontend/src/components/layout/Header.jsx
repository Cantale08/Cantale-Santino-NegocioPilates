import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { NAV_LINKS } from "../../data/contenido.js";
import Button from "../ui/Button.jsx";
import { CloseIcon, MenuIcon } from "../ui/Icons.jsx";
import Logo from "./Logo.jsx";
import "./Header.css";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }
        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [menuOpen]);

    return (
        <header className="header">
            <div className="container header__inner">
                <Logo />
                <button
                    type="button"
                    className="header__toggle"
                    aria-expanded={menuOpen}
                    aria-controls="menu-principal"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
                    <span className="visually-hidden">{menuOpen ? "Cerrar menú" : "Abrir menú"}</span>
                </button>
                <nav
                    id="menu-principal"
                    aria-label="Principal"
                    className={`header__nav${menuOpen ? " is-open" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    <ul className="header__links">
                        {NAV_LINKS.map((link) => (
                            <li key={link.to}>
                                {link.to.includes("#") ? (
                                    <Link to={link.to}>{link.label}</Link>
                                ) : (
                                    <NavLink to={link.to} end={link.end}>
                                        {link.label}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                    <Button to="/#clases" size="sm">
                        Reservar clase
                    </Button>
                </nav>
            </div>
        </header>
    );
}
