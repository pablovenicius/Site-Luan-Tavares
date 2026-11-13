// Cliente HTTP da API. Todas as chamadas passam por aqui e levam o login da recepção.
import type { Quarto, ReciboPayload, ReciboResposta } from './types';

const BASE = '/api';
const CHAVE_LOGIN = 'aruamar_auth';

/** Erro da API com os campos inválidos, quando houver. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly campos: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------- Login ----------

/** Credenciais ficam salvas neste navegador até o usuário clicar em Sair. */
export function temSessao(): boolean {
  try {
    return !!localStorage.getItem(CHAVE_LOGIN);
  } catch {
    return false;
  }
}

export function sair() {
  try {
    localStorage.removeItem(CHAVE_LOGIN);
  } catch {
    /* sem armazenamento disponível: nada a limpar */
  }
}

function cabecalhoAuth(): Record<string, string> {
  try {
    const valor = localStorage.getItem(CHAVE_LOGIN);
    return valor ? { Authorization: `Basic ${valor}` } : {};
  } catch {
    return {};
  }
}

/** Faz uma chamada autenticada. Se a sessão não valer mais, volta para a tela de login. */
async function fetchAuth(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers as Record<string, string> | undefined), ...cabecalhoAuth() },
  });
  if (res.status === 401) {
    sair();
    window.location.reload();
  }
  return res;
}

/** Valida e-mail e senha no servidor. Lança erro se estiverem errados. */
export async function entrar(usuario: string, senha: string): Promise<void> {
  const codificado = btoa(unescape(encodeURIComponent(`${usuario}:${senha}`)));
  const res = await fetch(`${BASE}/quartos`, {
    headers: { Authorization: `Basic ${codificado}` },
  });
  if (res.status === 401) throw new ApiError('E-mail ou senha incorretos.');
  if (!res.ok) throw new ApiError('Não foi possível entrar agora. Tente de novo.');
  try {
    localStorage.setItem(CHAVE_LOGIN, codificado);
  } catch {
    throw new ApiError('O navegador bloqueou o armazenamento. Libere cookies e tente de novo.');
  }
}

// ---------- Recibos e hóspedes ----------

/** Estadia atual ou próxima do hóspede (quarto e datas), vinda da API de reservas. */
export interface EstadiaResposta {
  quarto: string | null;
  checkin: string;
  checkout: string;
  adultos: number;
  criancas: number;
  diaria: number;
  sinal: number;
  status: string;
}

export interface PaginaHospedes {
  hospedes: HospedeBusca[];
  proximo: string | null;
}

export async function listarTodosHospedes(cursor?: string): Promise<PaginaHospedes> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  const res = await fetchAuth(`${BASE}/hospedes/lista${qs}`);
  return lerJson<PaginaHospedes>(res, 'Não foi possível carregar os hóspedes.');
}

export async function buscarEstadia(hospedeId: string): Promise<EstadiaResposta | null> {
  const res = await fetchAuth(`${BASE}/hospedes/${encodeURIComponent(hospedeId)}/estadia`);
  if (!res.ok) throw new ApiError('Não foi possível buscar a estadia.');
  return res.json();
}

export async function listarQuartos(): Promise<Quarto[]> {
  const res = await fetchAuth(`${BASE}/quartos`);
  if (!res.ok) throw new ApiError('Não foi possível carregar as suítes.');
  return res.json();
}

export async function criarDocumento(payload: ReciboPayload): Promise<ReciboResposta> {
  const res = await fetchAuth(`${BASE}/recibos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(json.erro ?? 'Erro ao salvar o documento.', json.detalhes ?? {});
  }
  return json as ReciboResposta;
}

/** Busca hóspedes pelo termo digitado. */
export async function buscarHospedes(termo: string, signal?: AbortSignal): Promise<Response> {
  return fetchAuth(`${BASE}/hospedes?q=${encodeURIComponent(termo)}`, { signal });
}

/**
 * Abre o PDF do recibo em nova aba.
 * Não dá para usar um link direto: a aba nova não envia o login. Por isso baixamos com o login
 * e abrimos o arquivo local.
 */
export async function abrirPdf(id: number): Promise<void> {
  const janela = window.open('', '_blank');
  try {
    const res = await fetchAuth(`${BASE}/recibos/${id}/pdf`);
    if (!res.ok) throw new ApiError('Não foi possível gerar o PDF.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (janela) janela.location.href = url;
    else window.open(url, '_blank');
  } catch (err) {
    janela?.close();
    throw err;
  }
}

/** PDF do recibo como arquivo (para baixar ou compartilhar). */
export async function baixarPdf(id: number): Promise<Blob> {
  const res = await fetchAuth(`${BASE}/recibos/${id}/pdf`);
  if (!res.ok) throw new ApiError('Não foi possível gerar o PDF.');
  return res.blob();
}

/** Imagem PNG do recibo (para copiar e colar no WhatsApp). */
export async function baixarImagem(id: number): Promise<Blob> {
  const res = await fetchAuth(`${BASE}/recibos/${id}/imagem`);
  if (!res.ok) throw new ApiError('Não foi possível gerar a imagem do recibo.');
  return res.blob();
}

// ---------- Operação: painel, quartos e reservas (somente leitura) ----------

export interface ReservaPeriodo {
  id: string;
  codigo: string | null;
  status: 'Confirmada' | 'Pré-reserva' | 'Aguardando pagamento' | 'Hospedado' | 'Bloqueado' | 'Encerrada';
  hospede: string;
  telefone: string | null;
  quarto: string | null;
  checkin: string;
  checkout: string;
  adultos: number;
  criancas: number;
  total: number;
  pago: number;
  saldo: number;
  totalDevido: number;
  origem: string;
}

export interface PainelDia {
  data: string;
  suitesTotal: number;
  suitesOcupadas: number;
  hospedesNoite: number;
  chegadas: ReservaPeriodo[];
  saidas: ReservaPeriodo[];
  hospedados: ReservaPeriodo[];
}

export type SituacaoQuarto = 'Livre' | 'Ocupado' | 'Chegando hoje' | 'Saindo hoje' | 'Bloqueado';

export interface QuartoStatus {
  numero: string;
  nome: string;
  capacidade: number;
  situacao: SituacaoQuarto;
  reserva: ReservaPeriodo | null;
}

async function lerJson<T>(res: Response, mensagemPadrao: string): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.erro ?? mensagemPadrao);
  return json as T;
}

export async function buscarPainel(data: string): Promise<PainelDia> {
  const res = await fetchAuth(`${BASE}/operacao/painel?data=${encodeURIComponent(data)}`);
  return lerJson<PainelDia>(res, 'Não foi possível carregar o painel.');
}

export async function buscarStatusQuartos(data: string): Promise<QuartoStatus[]> {
  const res = await fetchAuth(`${BASE}/operacao/quartos?data=${encodeURIComponent(data)}`);
  return lerJson<QuartoStatus[]>(res, 'Não foi possível carregar os quartos.');
}

export async function buscarReservasPeriodo(inicio: string, fim: string): Promise<ReservaPeriodo[]> {
  const res = await fetchAuth(
    `${BASE}/operacao/reservas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`,
  );
  return lerJson<ReservaPeriodo[]>(res, 'Não foi possível carregar as reservas.');
}

/** Hóspedes e empresas pelo termo digitado (mínimo de 3 caracteres). */
export async function buscarHospedesLista(termo: string): Promise<HospedeBusca[]> {
  const res = await buscarHospedes(termo);
  return lerJson<HospedeBusca[]>(res, 'Não foi possível buscar hóspedes.');
}

/** Tipo do hóspede, como vem da busca (importado do formulário). */
export interface HospedeBusca {
  id: string;
  tipo: 'PF' | 'PJ';
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  empresa: string | null;
}

// ---------- Operação: escrita (nova reserva, check-in e check-out) ----------

export interface NovaReservaPayload {
  checkin: string;
  checkout: string;
  quartoNumero: string;
  adultos: number;
  criancas: number;
  nome: string;
  telefone?: string;
  email?: string;
  documento?: string;
  observacoes?: string;
  jaCheckIn: boolean;
  guestId?: string;
  ratePlanId?: string;
  pagamento?: { valor: number; forma: string };
}

/** Chave única por formulário: se a rede cair, a nova tentativa não cria a reserva duas vezes. */
export function gerarChaveIdempotencia(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export async function criarReservaOperacao(payload: NovaReservaPayload, chave: string): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
    body: JSON.stringify(payload),
  });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível criar a reserva.');
}

export interface EdicaoReservaPayload {
  checkin: string;
  checkout: string;
  quartoNumero: string;
  adultos: number;
  criancas: number;
  pagamento?: { valor: number; forma: string };
}

export async function editarReservaOperacao(id: string, campos: EdicaoReservaPayload): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/reservas/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campos),
  });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível alterar a reserva.');
}

export async function cancelarReservaOperacao(id: string): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/reservas/${encodeURIComponent(id)}/cancelar`, { method: 'POST' });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível cancelar a reserva.');
}

export async function fazerCheckIn(id: string): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/reservas/${encodeURIComponent(id)}/checkin`, { method: 'POST' });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível fazer o check-in.');
}

export async function fazerCheckOut(id: string): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/reservas/${encodeURIComponent(id)}/checkout`, { method: 'POST' });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível fazer o check-out.');
}

export async function desbloquearOperacao(id: string): Promise<void> {
  const res = await fetchAuth(`${BASE}/operacao/bloqueios/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await lerJson<{ ok: boolean }>(res, 'Não foi possível desbloquear as datas.');
}

export type TarifasPeriodo = Record<string, Record<string, number | null>>;

export async function buscarTarifasPeriodo(inicio: string, fim: string): Promise<TarifasPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/tarifas?inicio=${inicio}&fim=${fim}`);
  return lerJson<TarifasPeriodo>(res, 'Não foi possível carregar as tarifas.');
}

export interface CategoriaQuarto {
  numero: string;
  categoria: string | null;
}

export async function buscarCategoriasQuartos(): Promise<CategoriaQuarto[]> {
  const res = await fetchAuth(`${BASE}/operacao/categorias`);
  return lerJson<CategoriaQuarto[]>(res, 'Não foi possível carregar as categorias das suítes.');
}

export interface BloqueioPayload {
  quartoNumero: string;
  checkin: string;
  checkout: string;
  motivo?: string;
}

export async function criarBloqueioOperacao(payload: BloqueioPayload, chave: string): Promise<ReservaPeriodo> {
  const res = await fetchAuth(`${BASE}/operacao/bloqueios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': chave },
    body: JSON.stringify(payload),
  });
  return lerJson<ReservaPeriodo>(res, 'Não foi possível bloquear as datas.');
}

export interface SuiteLivre {
  numero: string;
  nome: string;
  capacidade: number;
  maxAdultos: number;
  maxCriancas: number;
}

export interface PlanoCotacao {
  id: string;
  nome: string;
  total: number | null;
  indisponivel: string | null;
}

export async function buscarSuitesLivres(checkin: string, checkout: string, ignorar?: string): Promise<SuiteLivre[]> {
  const extra = ignorar ? `&ignorar=${encodeURIComponent(ignorar)}` : '';
  const res = await fetchAuth(
    `${BASE}/operacao/suites-livres?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}${extra}`,
  );
  return lerJson<SuiteLivre[]>(res, 'Não foi possível carregar as suítes livres.');
}

export async function buscarCotacao(
  quartoNumero: string,
  checkin: string,
  checkout: string,
  adultos: number,
): Promise<PlanoCotacao[]> {
  const params = new URLSearchParams({ quartoNumero, checkin, checkout, adultos: String(adultos) });
  const res = await fetchAuth(`${BASE}/operacao/cotacao?${params.toString()}`);
  return lerJson<PlanoCotacao[]>(res, 'Não foi possível calcular o valor da estadia.');
}
