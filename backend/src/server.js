import { createApp } from "./app.js";
import { Messages } from "./enums/Messages.js";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(Messages.INVALID_PORT);
}

const administrador = {
    nombre: "Administrador",
    apellido: "Shakti",
    email: process.env.ADMIN_EMAIL ?? "admin@shakti.com",
    contrasenia: process.env.ADMIN_PASSWORD ?? "admin1234"
};

const server = createApp({ administrador }).listen(port, () => {
    console.log(`${Messages.SERVER_STARTED} ${port}`);
});

server.on("error", (error) => {
    console.error(Messages.SERVER_START_ERROR, error);
    process.exitCode = 1;
});
