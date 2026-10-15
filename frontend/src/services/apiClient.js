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

export async function request(path, { method = "GET", body, signal } = {}) {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            signal,
            headers: body === undefined ? undefined : { "Content-Type": "application/json" },
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

    if (!response.ok || !payload?.success) {
        throw new ApiError(payload?.message ?? UNEXPECTED_RESPONSE, response.status);
    }

    return payload.data;
}
