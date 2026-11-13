import { Router } from 'express';
import { getReciboImagem, getReciboPdf, postRecibo } from '../controllers/recibo.controller';

export const reciboRouter = Router();

reciboRouter.post('/', postRecibo);
reciboRouter.get('/:id/pdf', getReciboPdf);
reciboRouter.get('/:id/imagem', getReciboImagem);
