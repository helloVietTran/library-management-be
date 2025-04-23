import { Request, Response, NextFunction } from "express";
import { isCelebrateError, CelebrateError } from "celebrate";

// Middleware handler request error
function validateErrorHandler(err: any, req: Request, res: Response, next: NextFunction): Response | void {
    if (isCelebrateError(err as CelebrateError)) {
        const celebrateError = err as CelebrateError;
        const errorDetails: Record<string, string[]> = {};

        for (const [segment, joiError] of celebrateError.details.entries()) {
            errorDetails[segment] = joiError.details.map(detail => detail.message);
        }

        return res.status(400).json({
            message: "Dữ liệu sai cấu trúc",
            errors: errorDetails,
        });
    }

    next(err);
}

export default validateErrorHandler;
