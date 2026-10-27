/** One invalid field of a request, listed in the `details` of a VALIDATION_ERROR. */
export interface ErrorDetail {
  path: string;
  message: string;
}

/** Error with an HTTP status and a stable machine-readable code; the error handler turns it into the response. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
