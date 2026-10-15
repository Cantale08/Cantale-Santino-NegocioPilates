import { Router } from "express";
import ClaseController from "../controllers/ClaseController.js";

export default function createClaseRouter(service) {
    const router = Router();
    const controller = new ClaseController(service);

    router.get("/", controller.obtenerTodas);
    router.get("/:id", controller.obtenerPorId);
    router.post("/", controller.crear);
    router.put("/:id", controller.modificar);
    router.delete("/:id", controller.eliminar);

    return router;
}
