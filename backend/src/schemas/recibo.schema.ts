// Validação do corpo de POST /api/recibos com zod.
// Regras de negócio que dependem de mais de um campo ficam no superRefine.
import { z } from 'zod';
import { PAGAMENTOS } from '../types';
import { noitesEntre, toCentavos } from '../utils/format';
import { validarDocumento } from '../utils/validators';

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato AAAA-MM-DD');

/** Campo opcional que aceita string vazia vinda do formulário (vira undefined). */
const opcional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

export const reciboSchema = z
  .object({
    tipo: z.enum(['RECIBO', 'PRE_RESERVA']),

    hospede: z.object({
      tipo: z.enum(['PF', 'PJ']),
      nome: z.string().trim().min(3, 'Informe o nome'),
      documento: z.string().transform((v) => v.replace(/\D/g, '')),
      ie: opcional(z.string().trim()),
      email: opcional(z.string().trim().email('E-mail inválido')),
      telefone: opcional(z.string().trim()),
      endereco: opcional(z.string().trim()),
      cidade: opcional(z.string().trim()),
      uf: opcional(z.string().trim().length(2, 'UF com 2 letras')),
      cep: opcional(z.string().trim()),
    }),

    /** Em RECIBO é o valor pago. Em PRE_RESERVA é o sinal (pode ser zero). */
    valor: z.number().min(0, 'Valor inválido'),
    pagamento: z.enum(PAGAMENTOS).optional(),
    dataPagamento: data.optional(),
    referente: z.string().trim().optional(),

    quartoId: z.number().int().positive().optional(),
    checkin: data.optional(),
    checkout: data.optional(),
    adultos: z.number().int().min(1).max(20).optional(),
    criancas: z.number().int().min(0).max(20).default(0),
    diaria: z.number().positive().optional(),

    observacoes: z.string().trim().optional(),
  })
  .superRefine((d, ctx) => {
    const erro = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

    // Pré-reserva aceita sem CPF/CNPJ. Recibo exige, e o documento informado precisa ser válido.
    const temDocumento = d.hospede.documento.length > 0;
    if (!temDocumento && d.tipo === 'RECIBO') {
      erro(['hospede', 'documento'], d.hospede.tipo === 'PJ' ? 'Informe o CNPJ' : 'Informe o CPF');
    } else if (temDocumento && !validarDocumento(d.hospede.documento, d.hospede.tipo)) {
      erro(['hospede', 'documento'], d.hospede.tipo === 'PJ' ? 'CNPJ inválido' : 'CPF inválido');
    }

    if (d.tipo === 'RECIBO') {
      if (d.valor <= 0) erro(['valor'], 'Informe um valor maior que zero');
      if (!d.pagamento) erro(['pagamento'], 'Informe a forma de pagamento');
      if (!d.dataPagamento) erro(['dataPagamento'], 'Informe a data do pagamento');
      if (!d.referente) erro(['referente'], 'Informe a referência do pagamento');
      return;
    }

    // PRE_RESERVA
    if (!d.quartoId) erro(['quartoId'], 'Selecione a suíte');
    if (!d.checkin) erro(['checkin'], 'Informe o check-in');
    if (!d.checkout) erro(['checkout'], 'Informe o check-out');
    if (!d.adultos) erro(['adultos'], 'Informe a quantidade de adultos');
    if (!d.diaria) erro(['diaria'], 'Informe a diária');

    if (d.checkin && d.checkout && d.checkout <= d.checkin) {
      erro(['checkout'], 'O check-out deve ser depois do check-in');
    }
    if (d.checkin && d.checkout && d.diaria) {
      const total = noitesEntre(d.checkin, d.checkout) * toCentavos(d.diaria);
      if (toCentavos(d.valor) > total) {
        erro(['valor'], 'O sinal não pode ser maior que o total da estadia');
      }
    }
  });

export type ReciboInput = z.infer<typeof reciboSchema>;
