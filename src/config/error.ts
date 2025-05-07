import { Response } from 'express';
import { isCelebrateError } from 'celebrate';

export class AppError extends Error {
  private statusCode: number = 500;
  private rootCause?: Error;

  private details: Record<string, any> = {};
  private logMessage?: string;

  private constructor(err: Error) {
    super(err.message);
  }

  static from(err: Error, statusCode: number = 500) {
    const appError = new AppError(err);
    appError.statusCode = statusCode;
    return appError;
  }

  getRootCause(): Error | null {
    if (this.rootCause) {
      return this.rootCause instanceof AppError ? this.rootCause.getRootCause() : this.rootCause;
    }

    return null;
  }

  wrap(rootCause: Error): AppError {
    const appError = AppError.from(this, this.statusCode);
    appError.rootCause = rootCause;
    return appError;
  }

  withDetail(key: string, value: any): AppError {
    this.details[key] = value;
    return this;
  }

  withLog(logMessage: string): AppError {
    this.logMessage = logMessage;
    return this;
  }

  withMessage(message: string): AppError {
    this.message = message;
    return this;
  }

  toJSON(isProduction: boolean = false) {
    const rootCause = this.getRootCause();

    return isProduction
      ? {
          message: this.message,
          statusCode: this.statusCode,
          details: this.details
        }
      : {
          message: this.message,
          statusCode: this.statusCode,
          rootCause: rootCause ? rootCause.message : this.message,
          details: this.details,
          logMessage: this.logMessage
        };
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}

export const ErrInternalServer = AppError.from(new Error('Something went wrong, please try again later.'), 500);
export const ErrInvalidRequest = AppError.from(new Error('Invalid request'), 400);
export const ErrUnauthorized = AppError.from(new Error('Unauthorized'), 401);
export const ErrForbidden = AppError.from(new Error('Forbidden'), 403);
export const ErrNotFound = AppError.from(new Error('Not found'), 404);
export const ErrMethodNotAllowed = AppError.from(new Error('Method not allowed'), 405);
export const ErrTokenInvalid = AppError.from(new Error('Token is invalid'), 401);

// error handler middleware
export const responseErr = (err: Error, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  !isProduction && console.error(err.stack);

  if (err instanceof AppError) {
    res.status(err.getStatusCode()).json(err.toJSON(isProduction));
    return;
  }

  // handle Joi error
  if (isCelebrateError(err)) {
    const appErr = ErrInvalidRequest;

    for (const [segment, joiError] of err.details.entries()) {
      joiError.details.forEach((detail) => {
        const path = detail.path.join('.');
        const message = detail.message;
        appErr.withDetail(`${segment}.${path}`, message);
      });
    }

    res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
    return;
  }

  // fallback: Internal Server Error
  const appErr = ErrInternalServer;
  res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
};
