import { Messages } from "../enums/Messages.js";
import { BadRequestError } from "../exceptions/AppError.js";
import { validarCuerpo } from "./cuerpo.js";
import { esFechaValida } from "./fechas.js";

const camposTurno = ["claseId", "fecha"];

export function validarTurno(data) {
    validarCuerpo(data, camposTurno, Messages.REQUIRED_TURNO);
    if (!Number.isSafeInteger(data.claseId) || data.claseId <= 0) {
        throw new BadRequestError(Messages.INVALID_CLASE_ID);
    }
    if (!esFechaValida(data.fecha)) {
        throw new BadRequestError(Messages.INVALID_FECHA);
    }
    return { claseId: data.claseId, fecha: data.fecha };
}
