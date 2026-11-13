import { Router } from 'express';
import { listarQuartos } from '../services/recibo.service';

export const quartoRouter = Router();

/** GET /api/quartos: lista as suítes para o select do formulário. */
quartoRouter.get('/', async (_req, res) => {
  res.json(await listarQuartos());
});
