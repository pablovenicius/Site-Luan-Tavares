// Rotas de operação (somente leitura): painel do dia, status das suítes e reservas do período.
import { Router } from 'express';
import { z } from 'zod';
import {
  fazerCheckIn,
  fazerCheckOut,
  novaReserva,
  novoBloqueio,
  desbloquearSuite,
  categoriasDosQuartos,
  tarifasDoPeriodo,
  cotacao,
  suitesLivres,
  painelDoDia,
  reservasDoPeriodo,
  statusDosQuartos,
  atualizarReserva,
  cancelarReserva,
} from '../services/operacao.service';

export const operacaoRouter = Router();

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD');

const dataSchema = z.object({ data: dataIso });

const periodoSchema = z
  .object({ inicio: dataIso, fim: dataIso })
  .refine((p) => p.fim >= p.inicio, 'A data final deve ser depois da inicial')
  .refine(
    (p) => Date.parse(p.fim) - Date.parse(p.inicio) <= 62 * 864e5,
    'O período máximo é de 62 dias',
  );

/** GET /api/operacao/painel?data= : resumo do dia, chegadas, saídas e hóspedes na casa. */
operacaoRouter.get('/painel', async (req, res) => {
  const { data } = dataSchema.parse(req.query);
  res.json(await painelDoDia(data));
});

/** GET /api/operacao/quartos?data= : situação de cada suíte no dia. */
operacaoRouter.get('/quartos', async (req, res) => {
  const { data } = dataSchema.parse(req.query);
  res.json(await statusDosQuartos(data));
});

/** GET /api/operacao/categorias : categoria de cada suíte. */
operacaoRouter.get('/categorias', async (_req, res) => {
  res.json(await categoriasDosQuartos());
});

/** GET /api/operacao/tarifas?inicio=&fim= : tarifa por noite de cada suíte no período. */
operacaoRouter.get('/tarifas', async (req, res) => {
  const { inicio, fim } = periodoSchema.parse(req.query);
  res.json(await tarifasDoPeriodo(inicio, fim));
});

/** GET /api/operacao/reservas?inicio=&fim= : reservas que passam pelo período. */
operacaoRouter.get('/reservas', async (req, res) => {
  const { inicio, fim } = periodoSchema.parse(req.query);
  res.json(await reservasDoPeriodo(inicio, fim));
});

const novaReservaSchema = z
  .object({
    checkin: dataIso,
    checkout: dataIso,
    quartoNumero: z.string().trim().min(1).max(10),
    adultos: z.number().int().min(1).max(20),
    criancas: z.number().int().min(0).max(20),
    nome: z.string().trim().min(2).max(120),
    telefone: z.string().trim().max(30).optional(),
    email: z.union([z.string().trim().email().max(120), z.literal('')]).optional(),
    observacoes: z.string().trim().max(1000).optional(),
    jaCheckIn: z.boolean().default(false),
    documento: z
      .string()
      .max(30)
      .optional()
      .transform((v) => (v ? v.replace(/\D/g, '') : ''))
      .refine((v) => v === '' || v.length === 11 || v.length === 14, 'CPF deve ter 11 números e CNPJ, 14'),
    guestId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
    ratePlanId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional(),
    pagamento: z
      .object({
        valor: z.number().positive().max(10000000),
        forma: z.enum(['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'other']),
      })
      .optional(),
  })
  .refine((p) => p.checkout > p.checkin, 'A saída precisa ser depois da entrada');

const idReservaSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]{8,64}$/, 'Reserva inválida'),
});

/**
 * POST /api/operacao/reservas : cria uma reserva. Envie o cabeçalho Idempotency-Key
 * com um valor único por formulário, para que uma nova tentativa não duplique a reserva.
 */
operacaoRouter.post('/reservas', async (req, res) => {
  const chave = z.string().min(8).max(255).parse(req.header('Idempotency-Key'));
  const d = novaReservaSchema.parse(req.body);
  const criada = await novaReserva(
    {
      checkin: d.checkin,
      checkout: d.checkout,
      quartoNumero: d.quartoNumero,
      adultos: d.adultos,
      criancas: d.criancas,
      hospede: {
        name: d.nome,
        phone: d.telefone || undefined,
        email: d.email || undefined,
        identityType: d.documento ? (d.documento.length === 14 ? 'cnpj' : 'cpf') : undefined,
        identityNumber: d.documento || undefined,
      },
      guestId: d.guestId,
      ratePlanId: d.ratePlanId,
      pagamento: d.pagamento,
      observacoes: d.observacoes,
      jaCheckIn: d.jaCheckIn,
    },
    chave,
  );
  res.status(201).json(criada);
});

const editarReservaSchema = z
  .object({
    checkin: dataIso,
    checkout: dataIso,
    quartoNumero: z.string().trim().min(1).max(10),
    adultos: z.number().int().min(1).max(20),
    criancas: z.number().int().min(0).max(20),
    pagamento: z
      .object({
        valor: z.number().positive().max(10000000),
        forma: z.enum(['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'other']),
      })
      .optional(),
  })
  .refine((p) => p.checkout > p.checkin, 'A saída precisa ser depois da entrada');

/** PATCH /api/operacao/reservas/:id : altera datas, suíte, ocupação e registra pagamento antecipado. */
operacaoRouter.patch('/reservas/:id', async (req, res) => {
  const { id } = idReservaSchema.parse(req.params);
  const d = editarReservaSchema.parse(req.body);
  res.json(await atualizarReserva(id, d));
});

/** POST /api/operacao/reservas/:id/cancelar : cancela a reserva. */
operacaoRouter.post('/reservas/:id/cancelar', async (req, res) => {
  const { id } = idReservaSchema.parse(req.params);
  res.json(await cancelarReserva(id));
});

/** POST /api/operacao/reservas/:id/checkin : registra a entrada do hóspede. */
operacaoRouter.post('/reservas/:id/checkin', async (req, res) => {
  const { id } = idReservaSchema.parse(req.params);
  res.json(await fazerCheckIn(id));
});

/** POST /api/operacao/reservas/:id/checkout : registra a saída do hóspede. */
operacaoRouter.post('/reservas/:id/checkout', async (req, res) => {
  const { id } = idReservaSchema.parse(req.params);
  res.json(await fazerCheckOut(id));
});

const bloqueioSchema = z
  .object({
    quartoNumero: z.string().trim().min(1).max(10),
    checkin: dataIso,
    checkout: dataIso,
    motivo: z.string().trim().max(200).optional(),
  })
  .refine((p) => p.checkout > p.checkin, 'O fim do bloqueio precisa ser depois do início');

/** DELETE /api/operacao/bloqueios/:id : desbloqueia a suíte nas datas do bloqueio. */
operacaoRouter.delete('/bloqueios/:id', async (req, res) => {
  const { id } = idReservaSchema.parse({ id: req.params.id });
  await desbloquearSuite(id);
  res.json({ ok: true });
});

/** POST /api/operacao/bloqueios : tira a suíte da venda nas datas escolhidas. */
operacaoRouter.post('/bloqueios', async (req, res) => {
  const chave = z.string().min(8).max(255).parse(req.header('Idempotency-Key'));
  const d = bloqueioSchema.parse(req.body);
  const bloqueado = await novoBloqueio(
    { quartoNumero: d.quartoNumero, checkin: d.checkin, checkout: d.checkout, motivo: d.motivo },
    chave,
  );
  res.status(201).json(bloqueado);
});

const periodoDiasSchema = z
  .object({ checkin: dataIso, checkout: dataIso })
  .refine((p) => p.checkout > p.checkin, 'A saída precisa ser depois da entrada');

/** GET /api/operacao/suites-livres?checkin=&checkout= : suítes disponíveis na estadia. */
operacaoRouter.get('/suites-livres', async (req, res) => {
  const { checkin, checkout } = periodoDiasSchema.parse(req.query);
  const ignorar = z.string().regex(/^[A-Za-z0-9-]{8,64}$/).optional().parse(req.query.ignorar);
  res.json(await suitesLivres(checkin, checkout, ignorar));
});

const cotacaoSchema = z
  .object({
    checkin: dataIso,
    checkout: dataIso,
    quartoNumero: z.string().trim().min(1).max(10),
    adultos: z.coerce.number().int().min(1).max(20),
  })
  .refine((p) => p.checkout > p.checkin, 'A saída precisa ser depois da entrada');

/** GET /api/operacao/cotacao : tarifas e valores da suíte na estadia. */
operacaoRouter.get('/cotacao', async (req, res) => {
  const d = cotacaoSchema.parse(req.query);
  res.json(await cotacao(d.quartoNumero, d.checkin, d.checkout, d.adultos));
});
