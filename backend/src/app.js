import express from "express";
import AdministradorRepository from "./repositories/AdministradorRepository.js";
import ClaseRepository from "./repositories/ClaseRepository.js";
import ClienteRepository from "./repositories/ClienteRepository.js";
import SesionRepository from "./repositories/SesionRepository.js";
import TurnoRepository from "./repositories/TurnoRepository.js";
import AuthService from "./services/AuthService.js";
import ClaseService from "./services/ClaseService.js";
import TurnoService from "./services/TurnoService.js";
import createAuthRouter from "./routes/authRoutes.js";
import createClaseRouter from "./routes/claseRoutes.js";
import createTurnoRouter from "./routes/turnoRoutes.js";
import { createAutenticar } from "./middlewares/authMiddleware.js";
import createCorsMiddleware from "./middlewares/corsMiddleware.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

const ADMIN_POR_DEFECTO = {
    nombre: "Administrador",
    apellido: "Shakti",
    email: "admin@shakti.com",
    contrasenia: "admin1234"
};

export function createApp({ ahora = () => new Date(), administrador = ADMIN_POR_DEFECTO } = {}) {
    const app = express();
    const claseRepository = new ClaseRepository();
    const clienteRepository = new ClienteRepository();
    const turnoRepository = new TurnoRepository();

    const authService = new AuthService({
        clienteRepository,
        administradorRepository: new AdministradorRepository(),
        sesionRepository: new SesionRepository(),
        ahora
    });
    authService.crearAdministrador(administrador);

    const claseService = new ClaseService(claseRepository, { turnoRepository, ahora });
    const turnoService = new TurnoService({ turnoRepository, claseRepository, clienteRepository, ahora });
    const autenticar = createAutenticar(authService);

    app.disable("x-powered-by");
    app.use(createCorsMiddleware());
    app.use(express.json({ limit: "100kb" }));
    app.use("/api/auth", createAuthRouter(authService, autenticar));
    app.use("/api/clases", createClaseRouter(claseService, autenticar));
    app.use("/api/turnos", createTurnoRouter(turnoService, autenticar));
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
