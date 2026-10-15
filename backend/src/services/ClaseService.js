import { Messages } from "../enums/Messages.js";
import { ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { validarClase, validarId } from "../utils/validaciones.js";

export default class ClaseService {
    constructor(repository) {
        this.repository = repository;
    }

    obtenerTodas() {
        return this.repository.obtenerTodas();
    }

    obtenerPorId(rawId) {
        const clase = this.repository.obtenerPorId(validarId(rawId));
        if (!clase) {
            throw new NotFoundError(Messages.CLASE_NOT_FOUND);
        }
        return clase;
    }

    crear(body) {
        const data = validarClase(body);
        if (this.repository.existeDuplicada(data)) {
            throw new ConflictError(Messages.DUPLICATED_RESOURCE);
        }
        return this.repository.crear(data);
    }

    modificar(rawId, body) {
        const clase = this.obtenerPorId(rawId);
        const data = validarClase(body);
        if (this.repository.existeDuplicada(data, clase.id)) {
            throw new ConflictError(Messages.DUPLICATED_RESOURCE);
        }
        return this.repository.modificar(clase.id, data);
    }

    eliminar(rawId) {
        const clase = this.obtenerPorId(rawId);
        return this.repository.eliminar(clase.id);
    }
}
