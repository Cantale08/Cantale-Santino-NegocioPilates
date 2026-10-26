import { successResponse } from "../responses/HttpResponse.js";

export default class AuthController {
    constructor(service) {
        this.service = service;
    }

    registrar = (req, res) => {
        return successResponse(res, this.service.registrar(req.body), 201);
    };

    login = (req, res) => {
        return successResponse(res, this.service.login(req.body));
    };

    perfil = (req, res) => {
        return successResponse(res, req.usuario);
    };

    logout = (req, res) => {
        this.service.cerrarSesion(req.token);
        return successResponse(res, null);
    };
}
