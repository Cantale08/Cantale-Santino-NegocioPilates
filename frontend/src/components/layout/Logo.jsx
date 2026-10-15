import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { NEGOCIO } from "../../data/contenido.js";
import "./Logo.css";

export default function Logo({ light = false }) {
    return (
        <Link to="/" className={`logo${light ? " logo--light" : ""}`}>
            <img src={logo} alt="" width="44" height="44" />
            <span>{NEGOCIO.nombre}</span>
        </Link>
    );
}
