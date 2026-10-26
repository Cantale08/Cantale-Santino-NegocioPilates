import { formatDia } from "./clases.js";

function parseFecha(fecha) {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    return { anio, mes, dia };
}

function diaSemana(fecha) {
    const { anio, mes, dia } = parseFecha(fecha);
    const indice = new Date(anio, mes - 1, dia).getDay();
    return ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][indice];
}

// "2026-10-27" -> "Martes 27/10"
export function formatFecha(fecha) {
    const { mes, dia } = parseFecha(fecha);
    return `${formatDia(diaSemana(fecha))} ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}

// "2026-10-27T09:00" -> "Martes 27/10 · 09:00 hs"
export function formatFechaHora(fechaHora) {
    const [fecha, hora] = fechaHora.split("T");
    return `${formatFecha(fecha)} · ${hora} hs`;
}

export function formatLugares(cantidad) {
    return cantidad === 1 ? "1 lugar disponible" : `${cantidad} lugares disponibles`;
}

export function estadoTurno(turno) {
    if (turno.estado === "cancelado") {
        return { value: "cancelado", label: "Cancelado" };
    }
    return turno.vigente
        ? { value: "reservado", label: "Reservado" }
        : { value: "finalizado", label: "Finalizado" };
}

// Primero los turnos vigentes (los más próximos arriba) y luego el historial (lo más reciente arriba).
export function ordenarTurnos(turnos) {
    const vigentes = turnos.filter((turno) => turno.vigente);
    const historial = turnos.filter((turno) => !turno.vigente);
    return [
        ...vigentes.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
        ...historial.sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
    ];
}

export function describirTurno(turno) {
    const clase = turno.clase ? turno.clase.tipo : "Clase eliminada";
    return `${clase}, ${formatFechaHora(turno.fechaHora)}`;
}
