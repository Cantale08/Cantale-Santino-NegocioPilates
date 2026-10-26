import { Messages } from "../enums/Messages.js";
import { BadRequestError } from "../exceptions/AppError.js";
import { validarCuerpo } from "./cuerpo.js";

const camposRegistro = ["nombre", "apellido", "email", "contrasenia", "telefono", "dni"];
const camposLogin = ["email", "contrasenia"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarTextoCorto(value, mensaje) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > 50) {
        throw new BadRequestError(mensaje);
    }
    return value.trim();
}

function validarEmail(value) {
    if (typeof value !== "string" || value.trim().length > 100 || !EMAIL.test(value.trim())) {
        throw new BadRequestError(Messages.INVALID_EMAIL);
    }
    return value.trim().toLowerCase();
}

function validarContrasenia(value) {
    if (typeof value !== "string" || value.length < 8 || value.length > 64) {
        throw new BadRequestError(Messages.INVALID_CONTRASENIA);
    }
    return value;
}

export function validarRegistro(data) {
    validarCuerpo(data, camposRegistro, Messages.REQUIRED_REGISTRO);
    const nombre = validarTextoCorto(data.nombre, Messages.INVALID_NOMBRE);
    const apellido = validarTextoCorto(data.apellido, Messages.INVALID_APELLIDO);
    const email = validarEmail(data.email);
    const contrasenia = validarContrasenia(data.contrasenia);

    const telefono = typeof data.telefono === "string" ? data.telefono.replace(/[\s-]/g, "") : "";
    if (!/^\+?\d{8,15}$/.test(telefono)) {
        throw new BadRequestError(Messages.INVALID_TELEFONO);
    }
    if (typeof data.dni !== "string" || !/^\d{7,8}$/.test(data.dni.trim())) {
        throw new BadRequestError(Messages.INVALID_DNI);
    }
    return { nombre, apellido, email, contrasenia, telefono, dni: data.dni.trim() };
}

export function validarLogin(data) {
    validarCuerpo(data, camposLogin, Messages.REQUIRED_LOGIN);
    if (typeof data.email !== "string" || typeof data.contrasenia !== "string") {
        throw new BadRequestError(Messages.REQUIRED_LOGIN);
    }
    return { email: data.email.trim().toLowerCase(), contrasenia: data.contrasenia };
}
