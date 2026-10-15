import express from "express";
import ClaseRepository from "./repositories/ClaseRepository.js";
import ClaseService from "./services/ClaseService.js";
import createClaseRouter from "./routes/claseRoutes.js";
import createCorsMiddleware from "./middlewares/corsMiddleware.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

export function createApp() {
    const app = express();
    const service = new ClaseService(new ClaseRepository());

    app.disable("x-powered-by");
    app.use(createCorsMiddleware());
    app.use(express.json({ limit: "100kb" }));
    app.use("/api/clases", createClaseRouter(service));
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
