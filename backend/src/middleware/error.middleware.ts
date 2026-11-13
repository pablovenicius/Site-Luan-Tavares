// Converte erros em respostas JSON padronizadas: { erro, detalhes? }.
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ erro: 'Dados inválidos', detalhes: err.flatten().fieldErrors });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ erro: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
};
