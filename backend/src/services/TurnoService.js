import { EstadoTurno } from "../enums/EstadoTurno.js";
import { Messages } from "../enums/Messages.js";
import { Roles } from "../enums/Roles.js";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError
} from "../exceptions/AppError.js";
import {
    diaDeLaSemana,
    formatearFecha,
    formatearFechaHora,
    sumarDias
} from "../utils/fechas.js";
import { validarId } from "../utils/validaciones.js";
import { validarTurno } from "../utils/validacionesTurno.js";

export const HORIZONTE_DIAS = 14;

export default class TurnoService {
    constructor({ turnoRepository, claseRepository, clienteRepository, ahora = () => new Date() }) {
        this.turnoRepository = turnoRepository;
        this.claseRepository = claseRepository;
        this.clienteRepository = clienteRepository;
        this.ahora = ahora;
    }

    obtenerDisponibilidad(rawClaseId) {
        const clases = rawClaseId === undefined
            ? this.claseRepository.obtenerTodas()
            : [this.#obtenerClase(validarId(rawClaseId))];
        const ahora = this.ahora();
        const ahoraTexto = formatearFechaHora(ahora);
        const disponibilidad = [];

        for (let dias = 0; dias <= HORIZONTE_DIAS; dias++) {
            const fecha = formatearFecha(sumarDias(ahora, dias));
            for (const clase of clases) {
                const fechaHora = `${fecha}T${clase.horario}`;
                if (diaDeLaSemana(fecha) !== clase.dia || fechaHora <= ahoraTexto) {
                    continue;
                }
                const reservados = this.turnoRepository.contarReservados(clase.id, fechaHora);
                disponibilidad.push({
                    claseId: clase.id,
                    tipo: clase.tipo,
                    dia: clase.dia,
                    horario: clase.horario,
                    instructorId: clase.instructorId,
                    fecha,
                    fechaHora,
                    cupoMaximo: clase.cupoMaximo,
                    reservados,
                    disponibles: Math.max(clase.cupoMaximo - reservados, 0)
                });
            }
        }
        return disponibilidad.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
    }

    reservar(usuario, body) {
        const { claseId, fecha } = validarTurno(body);
        const clase = this.#obtenerClase(claseId);
        if (diaDeLaSemana(fecha) !== clase.dia) {
            throw new BadRequestError(Messages.FECHA_NO_COINCIDE);
        }

        const ahora = this.ahora();
        const fechaHora = `${fecha}T${clase.horario}`;
        if (fechaHora <= formatearFechaHora(ahora)) {
            throw new BadRequestError(Messages.CLASE_YA_COMENZO);
        }
        if (fecha > formatearFecha(sumarDias(ahora, HORIZONTE_DIAS))) {
            throw new BadRequestError(Messages.FECHA_FUERA_DE_RANGO);
        }

        const existente = this.turnoRepository.obtenerReservadoDelCliente(usuario.id, fechaHora);
        if (existente) {
            throw new ConflictError(
                existente.claseId === clase.id ? Messages.TURNO_DUPLICADO : Messages.TURNO_SUPERPUESTO
            );
        }
        if (this.turnoRepository.contarReservados(clase.id, fechaHora) >= clase.cupoMaximo) {
            throw new ConflictError(Messages.CLASE_COMPLETA);
        }
        return this.#aVista(this.turnoRepository.crear({
            clienteId: usuario.id, claseId: clase.id, fechaHora
        }));
    }

    obtenerMisTurnos(usuario) {
        return this.#ordenar(this.turnoRepository.obtenerPorCliente(usuario.id));
    }

    obtenerTodos() {
        return this.#ordenar(this.turnoRepository.obtenerTodos());
    }

    cancelar(usuario, rawId) {
        const turno = this.turnoRepository.obtenerPorId(validarId(rawId));
        if (!turno) {
            throw new NotFoundError(Messages.TURNO_NOT_FOUND);
        }
        if (usuario.rol === Roles.CLIENTE && turno.clienteId !== usuario.id) {
            throw new ForbiddenError(Messages.ACCESO_DENEGADO);
        }
        if (turno.estado === EstadoTurno.CANCELADO) {
            throw new ConflictError(Messages.TURNO_YA_CANCELADO);
        }
        if (turno.fechaHora <= formatearFechaHora(this.ahora())) {
            throw new ConflictError(Messages.TURNO_PASADO);
        }
        return this.#aVista(this.turnoRepository.cancelar(turno.id));
    }

    #obtenerClase(id) {
        const clase = this.claseRepository.obtenerPorId(id);
        if (!clase) {
            throw new NotFoundError(Messages.CLASE_NOT_FOUND);
        }
        return clase;
    }

    #ordenar(turnos) {
        return turnos
            .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
            .map((turno) => this.#aVista(turno));
    }

    #aVista(turno) {
        const clase = this.claseRepository.obtenerPorId(turno.claseId);
        const cliente = this.clienteRepository.obtenerPorId(turno.clienteId);
        return {
            ...turno,
            vigente: turno.estado === EstadoTurno.RESERVADO &&
                turno.fechaHora > formatearFechaHora(this.ahora()),
            clase: clase ? { tipo: clase.tipo, dia: clase.dia, horario: clase.horario } : null,
            cliente: cliente
                ? { nombre: cliente.nombre, apellido: cliente.apellido, email: cliente.email }
                : null
        };
    }
}
