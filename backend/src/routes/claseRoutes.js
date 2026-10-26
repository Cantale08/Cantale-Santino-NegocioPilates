import { Router } from "express";
import ClaseController from "../controllers/ClaseController.js";
import { requerirRol } from "../middlewares/authMiddleware.js";
import { Roles } from "../enums/Roles.js";

export default function createClaseRouter(service, autenticar) {
    const router = Router();
    const controller = new ClaseController(service);
    const soloAdministrador = [autenticar, requerirRol(Roles.ADMINISTRADOR)];

    router.get("/", controller.obtenerTodas);
    router.get("/:id", controller.obtenerPorId);
    router.post("/", ...soloAdministrador, controller.crear);
    router.put("/:id", ...soloAdministrador, controller.modificar);
    router.delete("/:id", ...soloAdministrador, controller.eliminar);

    return router;
}
