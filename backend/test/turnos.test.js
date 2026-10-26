import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../src/app.js";
import { Messages } from "../src/enums/Messages.js";

// Lunes 26/10/2026 a las 10:00
let ahora;
let server;
let baseUrl;
let admin;

const clase = { tipo: "Reformer", dia: "martes", horario: "09:00", cupoMaximo: 2, instructorId: 1 };
const registro = {
    nombre: "Ana", apellido: "Pérez", email: "ana@mail.com", contrasenia: "secreta123",
    telefono: "11 5555-1234", dni: "30123456"
};

beforeEach(async () => {
    ahora = new Date(2026, 9, 26, 10, 0);
    server = createApp({ ahora: () => ahora }).listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    admin = (await api("/api/auth/login", "POST", null, {
        email: "admin@shakti.com", contrasenia: "admin1234"
    })).body.data.token;
});

afterEach(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

async function api(path, method = "GET", token = null, body) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

function assertError(result, status, message) {
    assert.equal(result.status, status);
    assert.deepEqual(result.body, { success: false, message });
}

async function registrar(datos = {}) {
    const result = await api("/api/auth/registro", "POST", null, { ...registro, ...datos });
    assert.equal(result.status, 201);
    return result.body.data.token;
}

async function crearClase(datos = {}) {
    return (await api("/api/clases", "POST", admin, { ...clase, ...datos })).body.data;
}

const otroCliente = { nombre: "Luis", apellido: "Gómez", email: "luis@mail.com", dni: "28999888" };

test("registra clientes, normaliza datos y nunca devuelve la contraseña", async () => {
    const result = await api("/api/auth/registro", "POST", null, {
        ...registro, email: " ANA@Mail.com ", telefono: "11 5555-1234"
    });
    assert.equal(result.status, 201);
    assert.match(result.body.data.token, /^[0-9a-f]{64}$/);
    assert.deepEqual(result.body.data.usuario, {
        id: 1, nombre: "Ana", apellido: "Pérez", email: "ana@mail.com",
        telefono: "1155551234", dni: "30123456", rol: "cliente"
    });
});

test("valida los datos de registro y rechaza email o DNI duplicados", async () => {
    const invalidos = [
        [[], Messages.INVALID_DATA],
        [{}, Messages.REQUIRED_REGISTRO],
        [{ ...registro, extra: 1 }, Messages.UNKNOWN_FIELDS],
        [{ ...registro, nombre: " " }, Messages.INVALID_NOMBRE],
        [{ ...registro, apellido: 5 }, Messages.INVALID_APELLIDO],
        [{ ...registro, email: "sin-arroba" }, Messages.INVALID_EMAIL],
        [{ ...registro, contrasenia: "corta" }, Messages.INVALID_CONTRASENIA],
        [{ ...registro, telefono: "abc" }, Messages.INVALID_TELEFONO],
        [{ ...registro, dni: "12.345.678" }, Messages.INVALID_DNI]
    ];
    for (const [body, message] of invalidos) {
        assertError(await api("/api/auth/registro", "POST", null, body), 400, message);
    }

    await registrar();
    assertError(
        await api("/api/auth/registro", "POST", null, { ...registro, dni: "11111111" }),
        409, Messages.EMAIL_DUPLICADO
    );
    assertError(
        await api("/api/auth/registro", "POST", null, { ...registro, email: "otro@mail.com" }),
        409, Messages.DNI_DUPLICADO
    );
    assertError(
        await api("/api/auth/registro", "POST", null, { ...registro, email: "admin@shakti.com", dni: "1" + "0".repeat(6) }),
        409, Messages.EMAIL_DUPLICADO
    );
});

test("inicia y cierra sesión, y protege las rutas con token", async () => {
    await registrar();
    const login = await api("/api/auth/login", "POST", null, {
        email: "ANA@mail.com", contrasenia: "secreta123"
    });
    assert.equal(login.status, 200);
    const token = login.body.data.token;

    const perfil = await api("/api/auth/perfil", "GET", token);
    assert.equal(perfil.body.data.email, "ana@mail.com");
    assert.equal(perfil.body.data.contrasenia, undefined);

    assertError(
        await api("/api/auth/login", "POST", null, { email: "ana@mail.com", contrasenia: "incorrecta1" }),
        401, Messages.CREDENCIALES_INVALIDAS
    );
    assertError(
        await api("/api/auth/login", "POST", null, { email: "nadie@mail.com", contrasenia: "secreta123" }),
        401, Messages.CREDENCIALES_INVALIDAS
    );
    assertError(await api("/api/auth/login", "POST", null, { email: "ana@mail.com" }), 400, Messages.REQUIRED_LOGIN);
    assertError(await api("/api/auth/perfil"), 401, Messages.TOKEN_REQUERIDO);
    assertError(await api("/api/auth/perfil", "GET", "falso"), 401, Messages.SESION_INVALIDA);

    assert.equal((await api("/api/auth/logout", "POST", token)).status, 200);
    assertError(await api("/api/auth/perfil", "GET", token), 401, Messages.SESION_INVALIDA);
});

test("las sesiones expiran después de 12 horas", async () => {
    const token = await registrar();
    ahora = new Date(2026, 9, 26, 22, 1);
    assertError(await api("/api/auth/perfil", "GET", token), 401, Messages.SESION_INVALIDA);
});

test("solo el administrador modifica clases", async () => {
    const token = await registrar();
    assertError(await api("/api/clases", "POST", null, clase), 401, Messages.TOKEN_REQUERIDO);
    assertError(await api("/api/clases", "POST", token, clase), 403, Messages.ACCESO_DENEGADO);
    assertError(await api("/api/clases/1", "PUT", token, clase), 403, Messages.ACCESO_DENEGADO);
    assertError(await api("/api/clases/1", "DELETE", token), 403, Messages.ACCESO_DENEGADO);
    assert.equal((await api("/api/clases")).status, 200);
});

test("consulta la disponibilidad de los próximos 14 días con los cupos restantes", async () => {
    const lunesTemprano = await crearClase({ dia: "lunes", horario: "09:00" });
    const martes = await crearClase();
    const token = await registrar();
    await api("/api/turnos", "POST", token, { claseId: martes.id, fecha: "2026-10-27" });

    const { body } = await api("/api/turnos/disponibilidad");
    const resumen = body.data.map((item) => [item.claseId, item.fecha, item.disponibles]);
    assert.deepEqual(resumen, [
        [martes.id, "2026-10-27", 1],
        [lunesTemprano.id, "2026-11-02", 2],
        [martes.id, "2026-11-03", 2],
        [lunesTemprano.id, "2026-11-09", 2]
    ]);
    assert.equal(body.data[0].fechaHora, "2026-10-27T09:00");

    const filtrada = await api(`/api/turnos/disponibilidad?claseId=${martes.id}`);
    assert.equal(filtrada.body.data.length, 2);
    assertError(await api("/api/turnos/disponibilidad?claseId=99"), 404, Messages.CLASE_NOT_FOUND);
    assertError(await api("/api/turnos/disponibilidad?claseId=x"), 400, Messages.INVALID_ID);
});

test("reserva un turno y lo lista en los turnos del cliente y del administrador", async () => {
    const { id: claseId } = await crearClase();
    const token = await registrar();

    const result = await api("/api/turnos", "POST", token, { claseId, fecha: "2026-10-27" });
    assert.equal(result.status, 201);
    assert.deepEqual(result.body.data, {
        id: 1, clienteId: 1, claseId, estado: "reservado", fechaHora: "2026-10-27T09:00",
        vigente: true,
        clase: { tipo: "Reformer", dia: "martes", horario: "09:00" },
        cliente: { nombre: "Ana", apellido: "Pérez", email: "ana@mail.com" }
    });

    assert.deepEqual((await api("/api/turnos/mis-turnos", "GET", token)).body.data, [result.body.data]);
    assert.deepEqual((await api("/api/turnos", "GET", admin)).body.data, [result.body.data]);
    assertError(await api("/api/turnos", "GET", token), 403, Messages.ACCESO_DENEGADO);
    assertError(await api("/api/turnos/mis-turnos", "GET", admin), 403, Messages.ACCESO_DENEGADO);
    assertError(await api("/api/turnos/mis-turnos"), 401, Messages.TOKEN_REQUERIDO);
});

test("valida los datos y las reglas de negocio al reservar", async () => {
    const { id: claseId } = await crearClase();
    const lunes = await crearClase({ dia: "lunes", horario: "09:00" });
    const token = await registrar();
    const reservar = (body, authToken = token) => api("/api/turnos", "POST", authToken, body);

    assertError(await reservar({}), 400, Messages.REQUIRED_TURNO);
    assertError(await reservar({ claseId, fecha: "2026-10-27", x: 1 }), 400, Messages.UNKNOWN_FIELDS);
    assertError(await reservar({ claseId: "1", fecha: "2026-10-27" }), 400, Messages.INVALID_CLASE_ID);
    assertError(await reservar({ claseId, fecha: "27/10/2026" }), 400, Messages.INVALID_FECHA);
    assertError(await reservar({ claseId, fecha: "2026-02-30" }), 400, Messages.INVALID_FECHA);
    assertError(await reservar({ claseId: 99, fecha: "2026-10-27" }), 404, Messages.CLASE_NOT_FOUND);
    assertError(await reservar({ claseId, fecha: "2026-10-28" }), 400, Messages.FECHA_NO_COINCIDE);
    assertError(await reservar({ claseId: lunes.id, fecha: "2026-10-26" }), 400, Messages.CLASE_YA_COMENZO);
    assertError(await reservar({ claseId, fecha: "2026-10-20" }), 400, Messages.CLASE_YA_COMENZO);
    assertError(await reservar({ claseId, fecha: "2026-11-17" }), 400, Messages.FECHA_FUERA_DE_RANGO);
    assertError(await reservar({ claseId, fecha: "2026-10-27" }, admin), 403, Messages.ACCESO_DENEGADO);
    assertError(await reservar({ claseId, fecha: "2026-10-27" }, null), 401, Messages.TOKEN_REQUERIDO);
    assert.deepEqual((await api("/api/turnos", "GET", admin)).body.data, []);
});

test("evita reservas duplicadas, turnos superpuestos y clases sin cupo", async () => {
    const { id: claseId } = await crearClase({ cupoMaximo: 1 });
    const otra = await crearClase({ tipo: "Mat", instructorId: 2 });
    const token = await registrar();
    const reserva = { claseId, fecha: "2026-10-27" };

    assert.equal((await api("/api/turnos", "POST", token, reserva)).status, 201);
    assertError(await api("/api/turnos", "POST", token, reserva), 409, Messages.TURNO_DUPLICADO);
    assertError(
        await api("/api/turnos", "POST", token, { claseId: otra.id, fecha: "2026-10-27" }),
        409, Messages.TURNO_SUPERPUESTO
    );

    const segundo = await registrar(otroCliente);
    assertError(await api("/api/turnos", "POST", segundo, reserva), 409, Messages.CLASE_COMPLETA);
    assert.equal((await api("/api/turnos", "POST", segundo, { claseId, fecha: "2026-11-03" })).status, 201);
});

test("cancela turnos, libera el cupo y respeta los permisos", async () => {
    const { id: claseId } = await crearClase({ cupoMaximo: 1 });
    const token = await registrar();
    const segundo = await registrar(otroCliente);
    const reserva = { claseId, fecha: "2026-10-27" };
    await api("/api/turnos", "POST", token, reserva);

    assertError(await api("/api/turnos/1/cancelar", "PATCH", segundo), 403, Messages.ACCESO_DENEGADO);
    assertError(await api("/api/turnos/1/cancelar", "PATCH"), 401, Messages.TOKEN_REQUERIDO);
    assertError(await api("/api/turnos/99/cancelar", "PATCH", token), 404, Messages.TURNO_NOT_FOUND);
    assertError(await api("/api/turnos/x/cancelar", "PATCH", token), 400, Messages.INVALID_ID);

    const cancelado = await api("/api/turnos/1/cancelar", "PATCH", token);
    assert.equal(cancelado.status, 200);
    assert.equal(cancelado.body.data.estado, "cancelado");
    assert.equal(cancelado.body.data.vigente, false);
    assertError(await api("/api/turnos/1/cancelar", "PATCH", token), 409, Messages.TURNO_YA_CANCELADO);

    assert.equal((await api("/api/turnos", "POST", segundo, reserva)).status, 201);
    assert.equal((await api("/api/turnos/2/cancelar", "PATCH", admin)).status, 200);
    assert.equal((await api("/api/turnos", "POST", token, reserva)).status, 201);
});

test("no permite cancelar turnos de clases que ya comenzaron", async () => {
    const { id: claseId } = await crearClase({ dia: "lunes", horario: "12:00" });
    const token = await registrar();
    await api("/api/turnos", "POST", token, { claseId, fecha: "2026-10-26" });

    ahora = new Date(2026, 9, 26, 12, 0);
    assertError(await api("/api/turnos/1/cancelar", "PATCH", token), 409, Messages.TURNO_PASADO);
    const [turno] = (await api("/api/turnos/mis-turnos", "GET", token)).body.data;
    assert.equal(turno.vigente, false);
});

test("protege las clases con turnos reservados y conserva el historial al eliminarlas", async () => {
    const { id: claseId } = await crearClase();
    const token = await registrar();
    const segundo = await registrar(otroCliente);
    await api("/api/turnos", "POST", token, { claseId, fecha: "2026-10-27" });
    await api("/api/turnos", "POST", segundo, { claseId, fecha: "2026-10-27" });

    assertError(await api(`/api/clases/${claseId}`, "DELETE", admin), 409, Messages.CLASE_CON_TURNOS);
    assertError(
        await api(`/api/clases/${claseId}`, "PUT", admin, { ...clase, horario: "10:00" }),
        409, Messages.CLASE_CON_TURNOS
    );
    assertError(
        await api(`/api/clases/${claseId}`, "PUT", admin, { ...clase, cupoMaximo: 1 }),
        409, Messages.CUPO_MENOR_A_RESERVAS
    );
    assert.equal((await api(`/api/clases/${claseId}`, "PUT", admin, { ...clase, instructorId: 5 })).status, 200);

    await api("/api/turnos/1/cancelar", "PATCH", token);
    await api("/api/turnos/2/cancelar", "PATCH", segundo);
    assert.equal((await api(`/api/clases/${claseId}`, "DELETE", admin)).status, 200);

    const [turno] = (await api("/api/turnos/mis-turnos", "GET", token)).body.data;
    assert.equal(turno.clase, null);
});
