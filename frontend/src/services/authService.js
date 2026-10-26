import { request } from "./apiClient.js";
import { clearToken, saveToken } from "./tokenStorage.js";

const RESOURCE = "/auth";

async function startSession(path, credentials) {
    const { token, usuario } = await request(`${RESOURCE}${path}`, { method: "POST", body: credentials });
    saveToken(token);
    return usuario;
}

export function register(datos) {
    return startSession("/registro", datos);
}

export function login(credentials) {
    return startSession("/login", credentials);
}

export function getProfile({ signal } = {}) {
    return request(`${RESOURCE}/perfil`, { signal });
}

export async function logout() {
    try {
        await request(`${RESOURCE}/logout`, { method: "POST" });
    } finally {
        clearToken();
    }
}
