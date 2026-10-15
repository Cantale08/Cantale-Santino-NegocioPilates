import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createClase,
    deleteClase,
    getClaseById,
    getClases,
    updateClase
} from "./clasesService.js";

const clase = { id: 1, tipo: "Reformer", dia: "lunes", horario: "09:00", cupoMaximo: 8, instructorId: 1 };

function mockFetch(body, { ok = true, status = 200 } = {}) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        status,
        json: typeof body === "function" ? body : () => Promise.resolve(body)
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("clasesService", () => {
    it("obtiene todas las clases y devuelve solo los datos", async () => {
        const fetchMock = mockFetch({ success: true, data: [clase] });

        await expect(getClases()).resolves.toEqual([clase]);
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:3000/api/clases",
            expect.objectContaining({ method: "GET" })
        );
    });

    it("obtiene una clase por ID", async () => {
        const fetchMock = mockFetch({ success: true, data: clase });

        await expect(getClaseById(1)).resolves.toEqual(clase);
        expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:3000/api/clases/1");
    });

    it("crea una clase enviando JSON", async () => {
        const fetchMock = mockFetch({ success: true, data: clase }, { status: 201 });
        const { id, ...payload } = clase;

        await expect(createClase(payload)).resolves.toEqual(clase);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://localhost:3000/api/clases");
        expect(options.method).toBe("POST");
        expect(options.headers).toEqual({ "Content-Type": "application/json" });
        expect(JSON.parse(options.body)).toEqual(payload);
    });

    it("modifica una clase con PUT", async () => {
        const fetchMock = mockFetch({ success: true, data: clase });

        await updateClase(1, { tipo: "Mat" });
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("http://localhost:3000/api/clases/1");
        expect(options.method).toBe("PUT");
    });

    it("elimina una clase con DELETE", async () => {
        const fetchMock = mockFetch({ success: true, data: clase });

        await expect(deleteClase(1)).resolves.toEqual(clase);
        expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE", body: undefined });
    });

    it("lanza el mensaje del backend cuando la respuesta es incorrecta", async () => {
        mockFetch({ success: false, message: "La clase no existe." }, { ok: false, status: 404 });

        await expect(getClaseById(9)).rejects.toMatchObject({
            message: "La clase no existe.",
            status: 404
        });
    });

    it("informa cuando no hay conexión con el servidor", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

        await expect(getClases()).rejects.toThrow(/No se pudo conectar con el servidor/);
    });

    it("informa cuando la respuesta no es JSON válido", async () => {
        mockFetch(() => Promise.reject(new SyntaxError("Unexpected token")), { ok: false, status: 502 });

        await expect(getClases()).rejects.toThrow("El servidor devolvió una respuesta inesperada.");
    });

    it("propaga la cancelación de la solicitud sin transformarla", async () => {
        const abortError = new DOMException("Aborted", "AbortError");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

        await expect(getClases()).rejects.toBe(abortError);
    });
});
