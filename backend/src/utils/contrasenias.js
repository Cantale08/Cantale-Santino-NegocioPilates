import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashContrasenia(contrasenia) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(contrasenia, salt, KEY_LENGTH).toString("hex");
    return `${salt}:${hash}`;
}

export function verificarContrasenia(contrasenia, almacenada) {
    const [salt, hash] = almacenada.split(":");
    const esperado = Buffer.from(hash, "hex");
    const calculado = scryptSync(contrasenia, salt, KEY_LENGTH);
    return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
