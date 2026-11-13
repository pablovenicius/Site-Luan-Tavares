// GET /api/hospedes?q=... : busca hóspedes e empresas na API de reservas.
import { Router } from 'express';
import { z } from 'zod';
import { buscarEstadiaAtual, buscarHospedes, listarHospedes } from '../services/lodgehog.service';

export const hospedeRouter = Router();

const querySchema = z.object({
  q: z.string().trim().min(3, 'Digite pelo menos 3 caracteres').max(100),
});

hospedeRouter.get('/', async (req, res) => {
  const { q } = querySchema.parse(req.query); // ZodError vira 400 no middleware
  const resultados = await buscarHospedes(q);
  res.json(resultados);
});

const listaSchema = z.object({ cursor: z.string().max(2000).optional() });

// GET /api/hospedes/lista?cursor= : todos os hóspedes, uma página por vez.
hospedeRouter.get('/lista', async (req, res) => {
  const { cursor } = listaSchema.parse(req.query);
  res.json(await listarHospedes(cursor));
});

const idSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]{1,64}$/, 'Hóspede inválido'),
});

// GET /api/hospedes/:id/estadia : quarto e datas da estadia atual ou próxima.
hospedeRouter.get('/:id/estadia', async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const estadia = await buscarEstadiaAtual(id);
  res.json(estadia);
});
