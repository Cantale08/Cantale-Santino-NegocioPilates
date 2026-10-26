import { Router } from "express";
import TurnoController from "../controllers/TurnoController.js";
import { requerirRol } from "../middlewares/authMiddleware.js";
import { Roles } from "../enums/Roles.js";

export default function createTurnoRouter(service, autenticar) {
    const router = Router();
    const controller = new TurnoController(service);

    router.get("/disponibilidad", controller.obtenerDisponibilidad);
    router.get("/mis-turnos", autenticar, requerirRol(Roles.CLIENTE), controller.obtenerMisTurnos);
    router.get("/", autenticar, requerirRol(Roles.ADMINISTRADOR), controller.obtenerTodos);
    router.post("/", autenticar, requerirRol(Roles.CLIENTE), controller.reservar);
    router.patch("/:id/cancelar", autenticar, controller.cancelar);

    return router;
}
