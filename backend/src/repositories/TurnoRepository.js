import Turno from "../models/Turno.js";
import { EstadoTurno } from "../enums/EstadoTurno.js";

export default class TurnoRepository {
    #turnos = [];
    #nextId = 1;

    obtenerTodos() {
        return this.#turnos.map((turno) => ({ ...turno }));
    }

    obtenerPorId(id) {
        const turno = this.#turnos.find((item) => item.id === id);
        return turno ? { ...turno } : undefined;
    }

    obtenerPorCliente(clienteId) {
        return this.#turnos
            .filter((turno) => turno.clienteId === clienteId)
            .map((turno) => ({ ...turno }));
    }

    #reservados() {
        return this.#turnos.filter((turno) => turno.estado === EstadoTurno.RESERVADO);
    }

    contarReservados(claseId, fechaHora) {
        return this.#reservados()
            .filter((turno) => turno.claseId === claseId && turno.fechaHora === fechaHora)
            .length;
    }

    obtenerReservadoDelCliente(clienteId, fechaHora) {
        const turno = this.#reservados()
            .find((item) => item.clienteId === clienteId && item.fechaHora === fechaHora);
        return turno ? { ...turno } : undefined;
    }

    obtenerReservadosPorClase(claseId) {
        return this.#reservados()
            .filter((turno) => turno.claseId === claseId)
            .map((turno) => ({ ...turno }));
    }

    crear(data) {
        const turno = new Turno(
            this.#nextId++, data.clienteId, data.claseId, EstadoTurno.RESERVADO, data.fechaHora
        );
        this.#turnos.push(turno);
        return { ...turno };
    }

    cancelar(id) {
        const turno = this.#turnos.find((item) => item.id === id);
        if (!turno) {
            return undefined;
        }
        turno.estado = EstadoTurno.CANCELADO;
        return { ...turno };
    }
}
