import { Dias } from "../enums/Dias.js";

const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (numero) => String(numero).padStart(2, "0");

export function formatearFecha(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Fecha y hora local con formato AAAA-MM-DDTHH:mm; permite comparar como texto.
export function formatearFechaHora(date) {
    return `${formatearFecha(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function esFechaValida(value) {
    const match = typeof value === "string" ? FECHA.exec(value) : null;
    if (!match) {
        return false;
    }
    const [anio, mes, dia] = match.slice(1).map(Number);
    const date = new Date(anio, mes - 1, dia);
    return date.getFullYear() === anio && date.getMonth() === mes - 1 && date.getDate() === dia;
}

export function diaDeLaSemana(fecha) {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const indice = new Date(anio, mes - 1, dia).getDay();
    return Dias[(indice + 6) % 7];
}

export function sumarDias(date, cantidad) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + cantidad);
}
