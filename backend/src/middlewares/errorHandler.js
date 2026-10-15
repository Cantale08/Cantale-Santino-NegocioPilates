import AppError from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { errorResponse } from "../responses/HttpResponse.js";

export default function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }
    if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
    }
    if (error.type === "entity.parse.failed") {
        return errorResponse(res, Messages.INVALID_JSON, 400);
    }
    if (error.type === "entity.too.large") {
        return errorResponse(res, Messages.PAYLOAD_TOO_LARGE, 413);
    }
    console.error(error);
    return errorResponse(res, Messages.INTERNAL_ERROR, 500);
}
