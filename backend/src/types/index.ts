// Tipos e constantes compartilhados pelo backend.
import type { Hospede, Quarto, Recibo, Reserva } from '@prisma/client';

/** Formas de pagamento aceitas (mesma lista usada no frontend). */
export const PAGAMENTOS = [
  'PIX',
  'Dinheiro',
  'Cartão de crédito',
  'Cartão de débito',
  'Transferência',
  'Faturado (empresa)',
] as const;

export type Pagamento = (typeof PAGAMENTOS)[number];
export type TipoDocumento = 'RECIBO' | 'PRE_RESERVA';
export type TipoPessoa = 'PF' | 'PJ';
export type StatusReserva = 'PRE_RESERVA' | 'CONFIRMADA' | 'CANCELADA';

/** Recibo com todas as relações necessárias para montar o PDF. */
export type ReciboCompleto = Recibo & {
  hospede: Hospede;
  quarto: Quarto | null;
  reserva: Reserva | null;
};
