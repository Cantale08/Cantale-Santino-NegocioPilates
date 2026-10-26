import { Messages } from "../enums/Messages.js";
import { ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { formatearFechaHora } from "../utils/fechas.js";
import { validarClase, validarId } from "../utils/validaciones.js";

export default class ClaseService {
    constructor(repository, { turnoRepository, ahora = () => new Date() } = {}) {
        this.repository = repository;
        this.turnoRepository = turnoRepository;
        this.ahora = ahora;
    }

    #turnosFuturos(claseId) {
        const ahora = formatearFechaHora(this.ahora());
        return (this.turnoRepository?.obtenerReservadosPorClase(claseId) ?? [])
            .filter((turno) => turno.fechaHora > ahora);
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

        const turnos = this.#turnosFuturos(clase.id);
        if (data.dia !== clase.dia || data.horario !== clase.horario) {
            if (turnos.length > 0) {
                throw new ConflictError(Messages.CLASE_CON_TURNOS);
            }
        }
        const reservasPorFecha = Map.groupBy(turnos, (turno) => turno.fechaHora);
        if ([...reservasPorFecha.values()].some((reservas) => reservas.length > data.cupoMaximo)) {
            throw new ConflictError(Messages.CUPO_MENOR_A_RESERVAS);
        }
        return this.repository.modificar(clase.id, data);
    }

    eliminar(rawId) {
        const clase = this.obtenerPorId(rawId);
        if (this.#turnosFuturos(clase.id).length > 0) {
            throw new ConflictError(Messages.CLASE_CON_TURNOS);
        }
        return this.repository.eliminar(clase.id);
    }
}
