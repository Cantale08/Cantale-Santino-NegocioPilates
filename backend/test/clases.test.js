import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { Messages } from "../src/enums/Messages.js";
import errorHandler from "../src/middlewares/errorHandler.js";
import ClaseRepository from "../src/repositories/ClaseRepository.js";

const clase = {
    tipo: "Reformer",
    dia: "lunes",
    horario: "09:00",
    cupoMaximo: 8,
    instructorId: 1
};

let server;
let baseUrl;

beforeEach(async () => {
    server = createApp().listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterEach(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

async function request(path = "/api/clases", method = "GET", body) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    assert.match(response.headers.get("content-type"), /application\/json/);
    return {
        status: response.status,
        location: response.headers.get("location"),
        body: await response.json()
    };
}

function assertError(result, status, message) {
    assert.equal(result.status, status);
    assert.deepEqual(result.body, { success: false, message });
}

test("CRUD completo con respuestas consistentes y persistencia entre solicitudes", async () => {
    assert.deepEqual((await request()).body, { success: true, data: [] });

    const created = await request("/api/clases", "POST", clase);
    assert.equal(created.status, 201);
    assert.equal(created.location, "/api/clases/1");
    assert.deepEqual(created.body, { success: true, data: { id: 1, ...clase } });
    assert.deepEqual((await request()).body.data, [{ id: 1, ...clase }]);
    assert.deepEqual((await request("/api/clases/1")).body, created.body);

    const updated = await request("/api/clases/1", "PUT", { ...clase, cupoMaximo: 10 });
    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body, {
        success: true, data: { id: 1, ...clase, cupoMaximo: 10 }
    });
    assert.deepEqual((await request("/api/clases/1")).body, updated.body);

    const deleted = await request("/api/clases/1", "DELETE");
    assert.equal(deleted.status, 200);
    assert.deepEqual(deleted.body, updated.body);
    assert.deepEqual((await request()).body, { success: true, data: [] });
    assertError(await request("/api/clases/1"), 404, Messages.CLASE_NOT_FOUND);

    const second = await request("/api/clases", "POST", clase);
    assert.equal(second.body.data.id, 2);
});

test("rechaza registros inexistentes en consulta, modificación y eliminación", async () => {
    for (const method of ["GET", "PUT", "DELETE"]) {
        assertError(
            await request("/api/clases/99", method, method === "PUT" ? clase : undefined),
            404, Messages.CLASE_NOT_FOUND
        );
    }
});

test("valida los IDs sin aceptar conversiones parciales o números inseguros", async () => {
    for (const id of ["0", "-1", "1.5", "1abc", "01", "9007199254740992"]) {
        for (const method of ["GET", "PUT", "DELETE"]) {
            assertError(
                await request(`/api/clases/${id}`, method, method === "PUT" ? clase : undefined),
                400, Messages.INVALID_ID
            );
        }
    }
});

test("valida todos los campos al crear y modificar sin alterar la memoria", async () => {
    await request("/api/clases", "POST", clase);
    const invalidCases = [
        [[], Messages.INVALID_DATA],
        [{}, Messages.REQUIRED_FIELDS],
        [{ ...clase, id: 20 }, Messages.UNKNOWN_FIELDS],
        [{ ...clase, tipo: "  " }, Messages.INVALID_TIPO],
        [{ ...clase, tipo: 1 }, Messages.INVALID_TIPO],
        [{ ...clase, dia: "otro" }, Messages.INVALID_DIA],
        [{ ...clase, horario: "24:00" }, Messages.INVALID_HORARIO],
        [{ ...clase, horario: "09:60" }, Messages.INVALID_HORARIO],
        [{ ...clase, horario: "9:00" }, Messages.INVALID_HORARIO],
        [{ ...clase, horario: 900 }, Messages.INVALID_HORARIO],
        [{ ...clase, cupoMaximo: 0 }, Messages.INVALID_CUPO],
        [{ ...clase, cupoMaximo: -1 }, Messages.INVALID_CUPO],
        [{ ...clase, cupoMaximo: 1.5 }, Messages.INVALID_CUPO],
        [{ ...clase, cupoMaximo: "8" }, Messages.INVALID_CUPO],
        [{ ...clase, instructorId: 0 }, Messages.INVALID_INSTRUCTOR],
        [{ ...clase, instructorId: "1" }, Messages.INVALID_INSTRUCTOR],
        [{ ...clase, instructorId: 1.5 }, Messages.INVALID_INSTRUCTOR]
    ];

    for (const [body, message] of invalidCases) {
        assertError(await request("/api/clases", "POST", body), 400, message);
        assertError(await request("/api/clases/1", "PUT", body), 400, message);
    }
    assert.deepEqual((await request()).body.data, [{ id: 1, ...clase }]);
});

test("rechaza duplicados al crear y modificar, pero permite conservar los propios datos", async () => {
    await request("/api/clases", "POST", clase);
    assertError(await request("/api/clases", "POST", clase), 409, Messages.DUPLICATED_RESOURCE);
    assert.equal((await request("/api/clases/1", "PUT", clase)).status, 200);
    const second = await request("/api/clases", "POST", { ...clase, horario: "10:00" });
    assertError(
        await request(`/api/clases/${second.body.data.id}`, "PUT", clase),
        409, Messages.DUPLICATED_RESOURCE
    );
    assert.equal((await request(`/api/clases/${second.body.data.id}`)).body.data.horario, "10:00");
});

test("normaliza espacios y admite los límites válidos de horarios y cupos", async () => {
    for (const horario of ["00:00", "23:59"]) {
        const result = await request("/api/clases", "POST", {
            ...clase, tipo: "  Reformer  ", horario, cupoMaximo: 1
        });
        assert.equal(result.status, 201);
        assert.equal(result.body.data.tipo, "Reformer");
    }
});

test("centraliza errores de JSON malformado, cuerpo ausente y tamaño excesivo", async () => {
    for (const [body, status, message] of [
        ['{"tipo":', 400, Messages.INVALID_JSON],
        [JSON.stringify({ tipo: "x".repeat(102400) }), 413, Messages.PAYLOAD_TOO_LARGE]
    ]) {
        const response = await fetch(`${baseUrl}/api/clases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });
        assertError({ status: response.status, body: await response.json() }, status, message);
    }
    assertError(await request("/api/clases", "POST"), 400, Messages.REQUIRED_FIELDS);
});

test("las rutas y métodos no implementados mantienen el formato de error", async () => {
    assertError(await request("/no-existe"), 404, Messages.ROUTE_NOT_FOUND);
    assertError(await request("/api/clases/1", "PATCH", clase), 404, Messages.ROUTE_NOT_FOUND);
});

test("permite solicitudes del frontend mediante CORS y rechaza otros orígenes", async () => {
    const preflight = (origin) => fetch(`${baseUrl}/api/clases/1`, {
        method: "OPTIONS",
        headers: {
            Origin: origin,
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "content-type"
        }
    });

    const allowed = await preflight("http://localhost:5173");
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.match(allowed.headers.get("access-control-allow-methods"), /PUT.*DELETE/);

    const denied = await preflight("http://sitio-externo.com");
    assert.equal(denied.headers.get("access-control-allow-origin"), null);

    const withError = await fetch(`${baseUrl}/api/clases/99`, {
        headers: { Origin: "http://localhost:5173" }
    });
    assert.equal(withError.status, 404);
    assert.equal(withError.headers.get("access-control-allow-origin"), "http://localhost:5173");
});

test("cada instancia comienza con su propio array vacío", async () => {
    await request("/api/clases", "POST", clase);
    const anotherServer = createApp().listen(0, "127.0.0.1");
    await once(anotherServer, "listening");
    try {
        const response = await fetch(`http://127.0.0.1:${anotherServer.address().port}/api/clases`);
        assert.deepEqual(await response.json(), { success: true, data: [] });
    } finally {
        await new Promise((resolve, reject) => {
            anotherServer.close((error) => error ? reject(error) : resolve());
        });
    }
});

test("el repositorio no expone referencias mutables a los registros", () => {
    const repository = new ClaseRepository();
    const created = repository.crear(clase);
    created.tipo = "Cambio externo";
    repository.obtenerTodas()[0].cupoMaximo = 0;
    repository.obtenerPorId(created.id).dia = "otro";
    assert.deepEqual(repository.obtenerPorId(created.id), { id: 1, ...clase });
});

test("los errores inesperados se registran sin filtrar detalles internos al cliente", (context) => {
    const error = new Error("detalle privado");
    const logger = context.mock.method(console, "error", () => {});
    let result;
    const res = {
        headersSent: false,
        status(status) {
            result = { status };
            return this;
        },
        json(body) {
            result.body = body;
        }
    };
    errorHandler(error, {}, res, () => assert.fail("No debe delegar la respuesta"));
    assertError(result, 500, Messages.INTERNAL_ERROR);
    assert.equal(logger.mock.callCount(), 1);
    assert.equal(logger.mock.calls[0].arguments[0], error);
});
