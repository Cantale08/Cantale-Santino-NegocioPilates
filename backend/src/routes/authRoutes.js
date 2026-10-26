import { Router } from "express";
import AuthController from "../controllers/AuthController.js";

export default function createAuthRouter(service, autenticar) {
    const router = Router();
    const controller = new AuthController(service);

    router.post("/registro", controller.registrar);
    router.post("/login", controller.login);
    router.get("/perfil", autenticar, controller.perfil);
    router.post("/logout", autenticar, controller.logout);

    return router;
}
