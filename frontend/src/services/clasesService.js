import { request } from "./apiClient.js";

const RESOURCE = "/clases";

export function getClases({ signal } = {}) {
    return request(RESOURCE, { signal });
}

export function getClaseById(id, { signal } = {}) {
    return request(`${RESOURCE}/${id}`, { signal });
}

export function createClase(clase) {
    return request(RESOURCE, { method: "POST", body: clase });
}

export function updateClase(id, clase) {
    return request(`${RESOURCE}/${id}`, { method: "PUT", body: clase });
}

export function deleteClase(id) {
    return request(`${RESOURCE}/${id}`, { method: "DELETE" });
}
