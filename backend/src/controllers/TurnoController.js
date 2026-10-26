import { successResponse } from "../responses/HttpResponse.js";

export default class TurnoController {
    constructor(service) {
        this.service = service;
    }

    obtenerDisponibilidad = (req, res) => {
        return successResponse(res, this.service.obtenerDisponibilidad(req.query.claseId));
    };

    obtenerMisTurnos = (req, res) => {
        return successResponse(res, this.service.obtenerMisTurnos(req.usuario));
    };

    obtenerTodos = (req, res) => {
        return successResponse(res, this.service.obtenerTodos());
    };

    reservar = (req, res) => {
        const turno = this.service.reservar(req.usuario, req.body);
        res.location(`/api/turnos/${turno.id}`);
        return successResponse(res, turno, 201);
    };

    cancelar = (req, res) => {
        return successResponse(res, this.service.cancelar(req.usuario, req.params.id));
    };
}
