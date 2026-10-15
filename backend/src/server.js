import { createApp } from "./app.js";
import { Messages } from "./enums/Messages.js";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(Messages.INVALID_PORT);
}

const server = createApp().listen(port, () => {
    console.log(`${Messages.SERVER_STARTED} ${port}`);
});

server.on("error", (error) => {
    console.error(Messages.SERVER_START_ERROR, error);
    process.exitCode = 1;
});
