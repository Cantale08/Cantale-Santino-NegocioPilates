import { Messages } from "../enums/Messages.js";
import { BadRequestError } from "../exceptions/AppError.js";

export function validarCuerpo(data, campos, mensajeRequeridos) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (Object.keys(data).some((campo) => !campos.includes(campo))) {
        throw new BadRequestError(Messages.UNKNOWN_FIELDS);
    }
    if (campos.some((campo) => !Object.hasOwn(data, campo))) {
        throw new BadRequestError(mensajeRequeridos);
    }
}
