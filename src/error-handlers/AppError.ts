class AppError extends Error {
  statusCode: number;
  path?: string | null;
  method?: string | null;

  constructor(message: string, statusCode: number = 500, path: string | null = null, method: string | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.path = path;
    this.method = method;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
