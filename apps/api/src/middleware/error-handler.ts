import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors.js';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Ruta no encontrada.'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  // Express and body-parser attach the HTTP status of client mistakes (bad JSON, oversized body, bad URL encoding).
  const status: unknown = err.status ?? err.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    req.log.warn({ err }, 'client error');
    if (status === 413) {
      res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'El cuerpo de la petición es demasiado grande.',
        },
      });
      return;
    }
    const message =
      err.type === 'entity.parse.failed'
        ? 'El cuerpo no es un JSON válido.'
        : 'La petición no es válida.';
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
    return;
  }
  req.log.error(err);
  res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' } });
};
