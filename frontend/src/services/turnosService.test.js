import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, logout } from "./authService.js";
import { cancelarTurno, getDisponibilidad, getMisTurnos, reservarTurno } from "./turnosService.js";
import { getToken } from "./tokenStorage.js";

function mockFetch(body, { ok = true, status = 200 } = {}) {
    const fetchMock = vi.fn().mockResolvedValue({ ok, status, json: () => Promise.resolve(body) });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("authService", () => {
    it("guarda el token al iniciar sesión y lo envía en las siguientes peticiones", async () => {
        const usuario = { id: 1, nombre: "Ana", rol: "cliente" };
        mockFetch({ success: true, data: { token: "abc", usuario } });
        await expect(login({ email: "a@a.com", contrasenia: "12345678" })).resolves.toEqual(usuario);
        expect(getToken()).toBe("abc");

        const fetchMock = mockFetch({ success: true, data: [] });
        await getMisTurnos();
        expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/api/turnos/mis-turnos");
        expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer abc" });
    });

    it("no guarda token si las credenciales son incorrectas", async () => {
        mockFetch({ success: false, message: "El email o la contraseña son incorrectos." }, { ok: false, status: 401 });
        await expect(login({ email: "a@a.com", contrasenia: "mala" })).rejects.toThrow(/incorrectos/);
        expect(getToken()).toBeNull();
    });

    it("elimina el token local al cerrar sesión", async () => {
        localStorage.setItem("pilates.token", "abc");
        mockFetch({ success: true, data: null });
        await logout();
        expect(getToken()).toBeNull();
    });
});

describe("turnosService", () => {
    it("consulta la disponibilidad sin credenciales", async () => {
        const fetchMock = mockFetch({ success: true, data: [] });
        await getDisponibilidad();
        expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/api/turnos/disponibilidad");
        expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
    });

    it("reserva enviando claseId y fecha", async () => {
        localStorage.setItem("pilates.token", "abc");
        const fetchMock = mockFetch({ success: true, data: { id: 1 } }, { status: 201 });
        await reservarTurno(3, "2026-10-27");
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://localhost:3000/api/turnos");
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ claseId: 3, fecha: "2026-10-27" });
    });

    it("cancela un turno con PATCH", async () => {
        const fetchMock = mockFetch({ success: true, data: { id: 5 } });
        await cancelarTurno(5);
        expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/api/turnos/5/cancelar");
        expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
    });

    it("limpia el token y avisa cuando la sesión expiró", async () => {
        localStorage.setItem("pilates.token", "vieja");
        mockFetch({ success: false, message: "La sesión no es válida o expiró." }, { ok: false, status: 401 });
        await expect(getMisTurnos()).rejects.toThrow(/expiró/);
        expect(getToken()).toBeNull();
    });
});
