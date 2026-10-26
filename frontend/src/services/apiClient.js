import { clearToken, getToken } from "./tokenStorage.js";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const NETWORK_ERROR = "No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.";
const UNEXPECTED_RESPONSE = "El servidor devolvió una respuesta inesperada.";

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
    unauthorizedHandler = handler;
}

function buildHeaders(body, token) {
    const headers = {};
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return Object.keys(headers).length > 0 ? headers : undefined;
}

export async function request(path, { method = "GET", body, signal } = {}) {
    const token = getToken();
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            signal,
            headers: buildHeaders(body, token),
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }
        throw new ApiError(NETWORK_ERROR);
    }

    let payload;
    try {
        payload = await response.json();
    } catch {
        throw new ApiError(UNEXPECTED_RESPONSE, response.status);
    }

    if (response.status === 401 && token) {
        clearToken();
        unauthorizedHandler?.();
    }

    if (!response.ok || !payload?.success) {
        throw new ApiError(payload?.message ?? UNEXPECTED_RESPONSE, response.status);
    }

    return payload.data;
}
