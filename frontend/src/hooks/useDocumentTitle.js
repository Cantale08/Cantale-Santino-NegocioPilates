import { useEffect } from "react";
import { NEGOCIO } from "../data/contenido.js";

export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | ${NEGOCIO.nombre}` : NEGOCIO.nombre;
    }, [title]);
}
