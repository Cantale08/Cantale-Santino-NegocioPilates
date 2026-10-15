import { Messages } from "../enums/Messages.js";
import { NotFoundError } from "../exceptions/AppError.js";

export default function notFoundHandler(req, res, next) {
    next(new NotFoundError(Messages.ROUTE_NOT_FOUND));
}
