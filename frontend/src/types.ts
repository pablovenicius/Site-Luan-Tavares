// Tipos espelhados do backend (backend/src/types e backend/src/schemas).
// Se a API mudar, atualize estes tipos junto.

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

export interface Quarto {
  id: number;
  numero: string;
  nome: string;
  capacidade: number;
}

/** Corpo enviado para POST /api/recibos. */
export interface ReciboPayload {
  tipo: TipoDocumento;
  hospede: {
    tipo: TipoPessoa;
    nome: string;
    documento: string;
    ie?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  valor: number;
  pagamento?: Pagamento;
  dataPagamento?: string;
  referente?: string;
  quartoId?: number;
  checkin?: string;
  checkout?: string;
  adultos?: number;
  criancas?: number;
  diaria?: number;
  observacoes?: string;
}

/** Resposta de POST /api/recibos (resumo do documento criado). */
export interface ReciboResposta {
  id: number;
  numero: number;
  tipo: TipoDocumento;
}
