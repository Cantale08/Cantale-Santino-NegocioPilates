import { request } from "./apiClient.js";

const RESOURCE = "/turnos";

export function getDisponibilidad({ signal } = {}) {
    return request(`${RESOURCE}/disponibilidad`, { signal });
}

export function getMisTurnos({ signal } = {}) {
    return request(`${RESOURCE}/mis-turnos`, { signal });
}

export function getTurnos({ signal } = {}) {
    return request(RESOURCE, { signal });
}

export function reservarTurno(claseId, fecha) {
    return request(RESOURCE, { method: "POST", body: { claseId, fecha } });
}

export function cancelarTurno(id) {
    return request(`${RESOURCE}/${id}/cancelar`, { method: "PATCH" });
}
