// Handlers HTTP de recibos. Validação e regras ficam no schema e no service.
import type { Request, Response } from 'express';
import { reciboSchema } from '../schemas/recibo.schema';
import { buscarReciboCompleto, criarRecibo } from '../services/recibo.service';
import { gerarPdf, gerarPng } from '../services/pdf.service';
import { renderReciboHtml } from '../templates/recibo.template';
import { AppError } from '../utils/AppError';
import { nomeArquivoAscii, nomeArquivoRecibo } from '../utils/nomeArquivo';

// Cache dos PDFs já gerados. Um recibo nunca é alterado depois de criado (não há rota de edição),
// então abrir o mesmo PDF de novo não precisa gerar outra vez. Limitado para não crescer sem fim.
const CACHE_MAX = 100;
const cache = new Map<number, Buffer>();

/** POST /api/recibos: cria recibo ou pré-reserva. Responde 201 com o documento. */
export async function postRecibo(req: Request, res: Response) {
  const input = reciboSchema.parse(req.body); // ZodError vira 400 no middleware
  const recibo = await criarRecibo(input);
  res.status(201).json(recibo);
}

/** GET /api/recibos/:id/pdf: gera e devolve o PDF do documento. */
/** GET /api/recibos/:id/imagem: PNG do recibo, para copiar e colar no WhatsApp. */
export async function getReciboImagem(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID inválido');

  const recibo = await buscarReciboCompleto(id);
  if (!recibo) throw new AppError(404, 'Documento não encontrado');

  const png = await gerarPng(renderReciboHtml(recibo));
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
}

export async function getReciboPdf(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID inválido');

  const recibo = await buscarReciboCompleto(id);
  if (!recibo) throw new AppError(404, 'Documento não encontrado');

  let pdf = cache.get(id);
  if (!pdf) {
    pdf = await gerarPdf(renderReciboHtml(recibo));
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as number);
    cache.set(id, pdf);
  }

  const nome = nomeArquivoRecibo(recibo.hospede.nome, recibo.tipo);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${nomeArquivoAscii(nome)}.pdf"; filename*=UTF-8''${encodeURIComponent(nome)}.pdf`,
  );
  res.send(pdf);
}
