import { successResponse } from "../responses/HttpResponse.js";

export default class ClaseController {
    constructor(service) {
        this.service = service;
    }

    obtenerTodas = (req, res) => {
        return successResponse(res, this.service.obtenerTodas());
    };

    obtenerPorId = (req, res) => {
        return successResponse(res, this.service.obtenerPorId(req.params.id));
    };

    crear = (req, res) => {
        const clase = this.service.crear(req.body);
        res.location(`/api/clases/${clase.id}`);
        return successResponse(res, clase, 201);
    };

    modificar = (req, res) => {
        return successResponse(res, this.service.modificar(req.params.id, req.body));
    };

    eliminar = (req, res) => {
        return successResponse(res, this.service.eliminar(req.params.id));
    };
}
