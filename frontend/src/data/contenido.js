import beneficioPostura from "../assets/beneficio-postura.svg";
import beneficioFlexibilidad from "../assets/beneficio-flexibilidad.svg";
import beneficioFuerza from "../assets/beneficio-fuerza.svg";
import beneficioBienestar from "../assets/beneficio-bienestar.svg";
import claseReformer from "../assets/clase-reformer.svg";
import claseMat from "../assets/clase-mat.svg";
import claseSalto from "../assets/clase-salto.svg";

export const NEGOCIO = {
    nombre: "Shakti Pilates",
    descripcion: "Centro de pilates del barrio, con clases pensadas para cuidar tu cuerpo.",
    direccion: "Bermúdez 437, Floresta",
    horarios: "Lunes a sábados de 8 a 14 hs. Domingos cerrado.",
    telefonos: [
        { texto: "11 5387-0226", href: "tel:+541153870226" },
        { texto: "11 2254-5023", href: "tel:+541122545023" }
    ],
    instagram: "https://www.instagram.com/pilates.shakti",
    facebook: "https://www.facebook.com/search/top?q=Shakti%20Floresta%20Pilates%20%26%20Yoga",
    mapa: "https://www.google.com/maps/search/?api=1&query=Berm%C3%BAdez+437+Floresta+Buenos+Aires"
};

export const NAV_LINKS = [
    { to: "/", label: "Inicio", end: true },
    { to: "/#beneficios", label: "Beneficios" },
    { to: "/#clases", label: "Clases" },
    { to: "/#sobre-nosotros", label: "Sobre nosotros" },
    { to: "/#contacto", label: "Contacto" }
];

export const NAV_LINKS_CLIENTE = [
    { to: "/reservar", label: "Reservar" },
    { to: "/mis-turnos", label: "Mis turnos" }
];

export const NAV_LINKS_ADMIN = [
    { to: "/admin/clases", label: "Gestión de clases" },
    { to: "/admin/turnos", label: "Gestión de turnos" }
];

export const BENEFICIOS = [
    {
        id: "postura",
        titulo: "Mejor postura",
        descripcion: "Fortalecemos la zona media para que sostengas tu espalda con naturalidad.",
        imagen: beneficioPostura,
        alt: "Ilustración de una columna vertebral alineada"
    },
    {
        id: "flexibilidad",
        titulo: "Más flexibilidad",
        descripcion: "Movimientos fluidos y controlados que ganan amplitud clase a clase.",
        imagen: beneficioFlexibilidad,
        alt: "Ilustración de una curva que representa un movimiento flexible"
    },
    {
        id: "fuerza",
        titulo: "Fuerza con control",
        descripcion: "Trabajamos con resortes y equipos Reformer para tonificar sin impacto.",
        imagen: beneficioFuerza,
        alt: "Ilustración de un resorte entre dos pesas"
    },
    {
        id: "bienestar",
        titulo: "Bienestar y calma",
        descripcion: "Un espacio sereno, con música suave, para desconectar y cuidarte.",
        imagen: beneficioBienestar,
        alt: "Ilustración de una flor de loto"
    }
];

export const IMAGENES_CLASES = [
    { src: claseReformer, alt: "Ilustración de una cama Reformer frente a un arco verde" },
    { src: claseMat, alt: "Ilustración de una colchoneta de pilates sobre el suelo" },
    { src: claseSalto, alt: "Ilustración de una tabla de salto y un box de entrenamiento" }
];
