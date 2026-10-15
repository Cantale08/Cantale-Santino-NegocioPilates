import { Dias } from "../enums/Dias.js";
import { Messages } from "../enums/Messages.js";
import { BadRequestError } from "../exceptions/AppError.js";

const camposClase = ["tipo", "dia", "horario", "cupoMaximo", "instructorId"];

export function validarId(value) {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return Number(value);
}

export function validarClase(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (Object.keys(data).some((campo) => !camposClase.includes(campo))) {
        throw new BadRequestError(Messages.UNKNOWN_FIELDS);
    }
    if (camposClase.some((campo) => !Object.hasOwn(data, campo))) {
        throw new BadRequestError(Messages.REQUIRED_FIELDS);
    }
    if (typeof data.tipo !== "string" || !data.tipo.trim()) {
        throw new BadRequestError(Messages.INVALID_TIPO);
    }
    if (!Dias.includes(data.dia)) {
        throw new BadRequestError(Messages.INVALID_DIA);
    }
    if (typeof data.horario !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.horario)) {
        throw new BadRequestError(Messages.INVALID_HORARIO);
    }
    if (!Number.isSafeInteger(data.cupoMaximo) || data.cupoMaximo <= 0) {
        throw new BadRequestError(Messages.INVALID_CUPO);
    }
    if (!Number.isSafeInteger(data.instructorId) || data.instructorId <= 0) {
        throw new BadRequestError(Messages.INVALID_INSTRUCTOR);
    }
    return {
        tipo: data.tipo.trim(),
        dia: data.dia,
        horario: data.horario,
        cupoMaximo: data.cupoMaximo,
        instructorId: data.instructorId
    };
}
