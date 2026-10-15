import { Link } from "react-router-dom";
import { NAV_LINKS, NEGOCIO } from "../../data/contenido.js";
import { FacebookIcon, InstagramIcon, MapPinIcon } from "../ui/Icons.jsx";
import Logo from "./Logo.jsx";
import "./Footer.css";

const REDES = [
    { nombre: "Instagram", usuario: "@pilates.shakti", href: NEGOCIO.instagram, Icono: InstagramIcon },
    { nombre: "Facebook", usuario: "Shakti Pilates & Yoga", href: NEGOCIO.facebook, Icono: FacebookIcon },
    { nombre: "Cómo llegar", usuario: "Ver en el mapa", href: NEGOCIO.mapa, Icono: MapPinIcon }
];

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__grid">
                <div className="footer__brand">
                    <Logo light />
                    <p>{NEGOCIO.descripcion}</p>
                </div>

                <nav aria-labelledby="footer-navegacion">
                    <h2 id="footer-navegacion">Navegación</h2>
                    <ul>
                        {NAV_LINKS.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <section id="contacto" tabIndex={-1} aria-labelledby="footer-contacto">
                    <h2 id="footer-contacto">Contacto</h2>
                    <address>
                        <p>{NEGOCIO.direccion}</p>
                        <p>{NEGOCIO.horarios}</p>
                        <ul>
                            {NEGOCIO.telefonos.map((telefono) => (
                                <li key={telefono.href}>
                                    <a href={telefono.href}>{telefono.texto}</a>
                                </li>
                            ))}
                        </ul>
                    </address>
                </section>

                <section aria-labelledby="footer-seguinos">
                    <h2 id="footer-seguinos">Seguinos</h2>
                    <ul className="footer__social">
                        {REDES.map(({ nombre, usuario, href, Icono }) => (
                            <li key={nombre}>
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                    <Icono />
                                    <span>
                                        {nombre}
                                        <span className="visually-hidden"> ({usuario}, se abre en una pestaña nueva)</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <p className="footer__legal">
                © {new Date().getFullYear()} {NEGOCIO.nombre}. Todos los derechos reservados.
            </p>
        </footer>
    );
}
