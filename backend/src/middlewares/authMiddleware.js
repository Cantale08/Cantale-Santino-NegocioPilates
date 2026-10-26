import { Messages } from "../enums/Messages.js";
import { ForbiddenError } from "../exceptions/AppError.js";

export function createAutenticar(authService) {
    return (req, res, next) => {
        const [esquema, token] = (req.headers.authorization ?? "").split(" ");
        req.token = esquema === "Bearer" ? token : undefined;
        req.usuario = authService.autenticar(req.token);
        next();
    };
}

export function requerirRol(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            throw new ForbiddenError(Messages.ACCESO_DENEGADO);
        }
        next();
    };
}
