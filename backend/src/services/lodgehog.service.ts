// Integração somente leitura com a API de reservas (Lodgehog).
// A chave fica no servidor (LODGEHOG_API_KEY). O navegador nunca a recebe.
// Documentação: https://api.lodgehog.com/v1/docs/
import { randomUUID } from 'crypto';
import { AppError } from '../utils/AppError';

const BASE = (process.env.LODGEHOG_BASE_URL ?? 'https://api.lodgehog.com/v1').replace(/\/$/, '');

/** Formato que o frontend usa para preencher o formulário. */
export interface HospedeBusca {
  id: string;
  tipo: 'PF' | 'PJ';
  nome: string;
  documento: string; // só dígitos
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  empresa: string | null;
}

/** Endereço separado nos campos do recibo. */
export interface EnderecoSeparado {
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
}

/**
 * Separa o endereço da QuartoVerde (texto único, ex.:
 * "Rua X, Bairro, Aracaju, SE, 49030-680, Brasil") em endereço, cidade, UF e CEP.
 */
export function separarEndereco(texto: string | null): EnderecoSeparado {
  const vazio: EnderecoSeparado = { endereco: null, cidade: null, uf: null, cep: null };
  if (!texto || !texto.trim()) return vazio;

  let partes = texto.split(',').map((p) => p.trim()).filter(Boolean);
  if (partes.length > 1 && /^brasil$/i.test(partes[partes.length - 1])) {
    partes = partes.slice(0, -1);
  }

  // CEP: 8 dígitos, com ou sem traço. Sai da lista e volta formatado.
  let cep: string | null = null;
  const iCep = partes.findIndex((p) => /^\d{5}-?\d{3}$/.test(p));
  if (iCep >= 0) {
    const d = partes[iCep].replace(/\D/g, '');
    cep = `${d.slice(0, 5)}-${d.slice(5)}`;
    partes.splice(iCep, 1);
  }

  // UF: última parte com exatamente 2 letras. A cidade é a parte logo antes dela.
  let iUf = -1;
  for (let i = partes.length - 1; i >= 0; i--) {
    if (/^[A-Za-z]{2}$/.test(partes[i])) {
      iUf = i;
      break;
    }
  }
  let uf: string | null = null;
  let cidade: string | null = null;
  if (iUf >= 0) {
    uf = partes[iUf].toUpperCase();
    if (iUf > 0) cidade = partes[iUf - 1];
  }

  const resto = partes.filter((_, i) => i !== iUf && !(iUf > 0 && i === iUf - 1));
  return { endereco: resto.join(', ') || null, cidade, uf, cep };
}

/** Campos do hóspede como a API devolve (ver o schema "Guest"). */
interface GuestApi {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  identity_type: string | null;
  identity_number: string | null;
  address: string | null;
  company: { name: string; tax_document: string | null } | null;
}

interface ListaApi {
  next: string | null;
  previous: string | null;
  results: GuestApi[];
}

const digitos = (s: string) => s.replace(/\D/g, '');

/** Converte um hóspede da API para o formato do formulário. */
function paraHospede(g: GuestApi): HospedeBusca {
  const doc = digitos(g.identity_number ?? g.company?.tax_document ?? '');
  // cnpj é empresa; qualquer outro tipo (cpf, passaporte etc.) é pessoa física.
  const ehEmpresa = g.identity_type === 'cnpj';
  const end = separarEndereco(g.address ?? null);
  return {
    id: g.id,
    tipo: ehEmpresa ? 'PJ' : 'PF',
    nome: g.company?.name && ehEmpresa ? g.company.name : g.name,
    documento: doc,
    telefone: g.phone ?? null,
    email: g.email ?? null,
    endereco: end.endereco,
    cidade: end.cidade,
    uf: end.uf,
    cep: end.cep,
    empresa: g.company?.name ?? null,
  };
}

/**
 * Busca hóspedes e empresas na propriedade.
 * - Se o termo tiver 11 ou 14 dígitos, busca pelo documento (CPF ou CNPJ).
 * - Caso contrário, busca por nome ou e-mail.
 */
export async function buscarHospedes(termo: string): Promise<HospedeBusca[]> {
  const chave = process.env.LODGEHOG_API_KEY;
  if (!chave) {
    throw new AppError(503, 'Sistema de reservas não configurado no servidor.');
  }

  const params = new URLSearchParams({ limit: '10' });
  const doc = digitos(termo);
  if (doc.length === 11 || doc.length === 14) {
    params.set('identity_number', doc);
  } else {
    params.set('q', termo);
  }

  const json = await consultar<ListaApi>('/guests/', params);
  return json.results.map(paraHospede);
}

/**
 * Lista todos os hóspedes, uma página por vez. O cursor é o link da próxima página
 * que a própria API devolve, codificado em base64; só aceitamos links da API da pousada.
 */
export async function listarHospedes(cursor?: string): Promise<{ hospedes: HospedeBusca[]; proximo: string | null }> {
  const chave = process.env.LODGEHOG_API_KEY;
  if (!chave) throw new AppError(503, 'Sistema de reservas não configurado no servidor.');

  let url: string;
  if (cursor) {
    url = Buffer.from(cursor, 'base64url').toString('utf8');
    if (!url.startsWith(`${BASE}/guests/`)) throw new AppError(400, 'Página inválida.');
  } else {
    url = `${BASE}/guests/?${new URLSearchParams({ limit: '50' }).toString()}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${chave}`, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new AppError(502, 'Não foi possível falar com o sistema de reservas. Tente de novo.');
  }
  if (!res.ok) {
    console.error(`[lodgehog] HTTP ${res.status} ao listar hóspedes (request ${res.headers.get('x-request-id') ?? 'sem-id'})`);
    throw new AppError(502, 'Não foi possível carregar os hóspedes.');
  }

  const json = (await res.json()) as ListaApi;
  let proximo: string | null = null;
  if (json.next) {
    const absoluto = new URL(json.next, 'https://api.lodgehog.com').toString();
    if (absoluto.startsWith(`${BASE}/guests/`)) proximo = Buffer.from(absoluto, 'utf8').toString('base64url');
  }
  return { hospedes: json.results.map(paraHospede), proximo };
}

/** Estadia do hóspede: quarto e datas que o recibo usa. */
export interface EstadiaBusca {
  quarto: string | null; // número do quarto, ex.: "104"
  checkin: string; // AAAA-MM-DD
  checkout: string; // AAAA-MM-DD
  adultos: number;
  criancas: number;
  diaria: number; // total da estadia dividido pelas noites (o recibo multiplica de volta)
  sinal: number; // valor já pago na QuartoVerde ("Pago")
  status: string;
}

interface ReservaApi {
  status: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  rooms: { room: { id: string; name: string } | null }[];
  totals: { total_price: string; total_payments: string } | null;
}

const centavos = (valor: string | undefined) => Math.round(Number(valor ?? 0) * 100) / 100;

/**
 * Busca a estadia atual ou a próxima do hóspede.
 * Prefere "checked_in" (hospedado) e depois "confirmed" (confirmada).
 * Reservas canceladas ou já encerradas são ignoradas.
 */
export async function buscarEstadiaAtual(guestId: string): Promise<EstadiaBusca | null> {
  if (!process.env.LODGEHOG_API_KEY) {
    throw new AppError(503, 'Sistema de reservas não configurado no servidor.');
  }

  const params = new URLSearchParams({
    guest: guestId,
    status: 'checked_in,confirmed',
    limit: '20',
  });
  const json = await consultar<{ results: ReservaApi[] }>('/reservations/', params);

  const ordem = (s: string) => (s === 'checked_in' ? 0 : 1);
  const escolhida = json.results
    .filter((r) => r.status === 'checked_in' || r.status === 'confirmed')
    .sort((a, b) => ordem(a.status) - ordem(b.status) || b.checkin_date.localeCompare(a.checkin_date))[0];

  if (!escolhida) return null;

  const noites = Math.max(
    Math.round((Date.parse(escolhida.checkout_date) - Date.parse(escolhida.checkin_date)) / 864e5),
    1,
  );
  const total = centavos(escolhida.totals?.total_price);

  return {
    quarto: escolhida.rooms[0]?.room?.name ?? null,
    checkin: escolhida.checkin_date,
    checkout: escolhida.checkout_date,
    adultos: escolhida.adults,
    criancas: escolhida.children,
    diaria: Math.round((total / noites) * 100) / 100,
    sinal: centavos(escolhida.totals?.total_payments),
    status: escolhida.status,
  };
}

/** Faz um GET somente leitura na API e traduz os erros para mensagens do sistema. */
/** Leituras da API: salas mudam pouco; reservas mudam com a operação, então ficam só alguns segundos. */
const TTL_SALAS_MS = 10 * 60 * 1000;
const TTL_RESERVAS_MS = 20 * 1000;

/**
 * A API aceita até 120 chamadas por minuto. As chamadas passam por uma fila com espaçamento,
 * e as consultas principais (reservas, salas, escritas) sempre passam na frente das tarifas.
 */
const INTERVALO_MIN_CHAMADAS_MS = 600;
type Prioridade = 'principal' | 'tarifa';
const filaPrincipal: (() => void)[] = [];
const filaTarifa: (() => void)[] = [];
let ultimaChamada = 0;
let agendado = false;

function processarFila(): void {
  agendado = false;
  const liberar = filaPrincipal.shift() ?? filaTarifa.shift();
  if (!liberar) return;
  ultimaChamada = Date.now();
  liberar();
  if (filaPrincipal.length || filaTarifa.length) agendarFila();
}

function agendarFila(): void {
  if (agendado) return;
  agendado = true;
  setTimeout(processarFila, Math.max(0, ultimaChamada + INTERVALO_MIN_CHAMADAS_MS - Date.now()));
}

function esperarVez(prioridade: Prioridade = 'principal'): Promise<void> {
  return new Promise((resolve) => {
    (prioridade === 'principal' ? filaPrincipal : filaTarifa).push(resolve);
    agendarFila();
  });
}

const cacheLeitura = new Map<string, { promessa: Promise<unknown>; ate: number }>();

function limparCacheReservas(): void {
  for (const chave of cacheLeitura.keys()) {
    if (chave.startsWith('/reservations/')) cacheLeitura.delete(chave);
  }
}

/** GET com cache curto (também junta chamadas iguais feitas ao mesmo tempo). */
async function consultar<T>(caminho: string, params: URLSearchParams, ttlMs = 0, prioridade: Prioridade = 'principal'): Promise<T> {
  const chave = `${caminho}?${params.toString()}`;
  if (ttlMs > 0) {
    const hit = cacheLeitura.get(chave);
    if (hit && hit.ate > Date.now()) return hit.promessa as Promise<T>;
  }
  const promessa = consultarComEspera<T>(caminho, params, prioridade);
  if (ttlMs > 0) {
    cacheLeitura.set(chave, { promessa, ate: Date.now() + ttlMs });
    promessa.catch(() => cacheLeitura.delete(chave));
  }
  return promessa;
}

/** Chama a API na vez da fila e tenta de novo, com pausa, se ela responder 429. */
async function consultarComEspera<T>(caminho: string, params: URLSearchParams, prioridade: Prioridade): Promise<T> {
  for (let tentativa = 1; ; tentativa++) {
    await esperarVez(prioridade);
    try {
      return await consultarUmaVez<T>(caminho, params);
    } catch (err) {
      if (err instanceof AppError && err.status === 429 && tentativa < 4) {
        await new Promise((r) => setTimeout(r, 1500 * tentativa));
        continue;
      }
      throw err;
    }
  }
}

async function consultarUmaVez<T>(caminho: string, params: URLSearchParams): Promise<T> {
  const chave = process.env.LODGEHOG_API_KEY as string;

  let res: Response;
  try {
    res = await fetch(`${BASE}${caminho}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${chave}`,
        Accept: 'application/json',
      },
      redirect: 'error', // a API não redireciona; se redirecionar, algo está errado
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new AppError(502, 'Não foi possível falar com o sistema de reservas. Tente de novo.');
  }

  // Guarda o X-Request-Id para o suporte localizar a chamada, se precisar.
  const requestId = res.headers.get('x-request-id') ?? 'sem-id';

  if (!res.ok) {
    console.error(`[lodgehog] HTTP ${res.status} em ${caminho} (request ${requestId})`);
    switch (res.status) {
      case 401:
        throw new AppError(502, 'Chave do sistema de reservas inválida ou revogada.');
      case 402:
        throw new AppError(502, 'O plano atual não inclui acesso à API de reservas.');
      case 403:
        throw new AppError(502, 'A chave do sistema de reservas não tem permissão de leitura.');
      case 429:
        throw new AppError(429, 'Muitas buscas seguidas. Aguarde alguns segundos.');
      default:
        throw new AppError(502, 'Erro ao consultar o sistema de reservas.');
    }
  }

  return (await res.json()) as T;
}

interface ReservaCompletaApi {
  id: string;
  booking_code: string | null;
  status: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  guest: { name: string; phone: string | null } | null;
  rooms: { room: { id: string; name: string } | null }[];
  totals: { total_price: string; total_payments: string; total_due: string } | null;
  source?: { channel_name: string | null; made_by: string } | null;
  notes?: string | null;
}

/** Reserva normalizada para as telas de operação (início, reservas, quartos). */
export type StatusReservaTela =
  | 'Confirmada'
  | 'Pré-reserva'
  | 'Aguardando pagamento'
  | 'Hospedado'
  | 'Bloqueado'
  | 'Encerrada';

export interface ReservaPeriodo {
  id: string;
  codigo: string | null;
  status: StatusReservaTela;
  hospede: string;
  telefone: string | null;
  quarto: string | null; // número da suíte, ex.: "102"
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

const ORIGEM_API_PARA_TELA: Record<string, string> = {
  pms: 'Recepção',
  booking_engine: 'Site de reservas',
  chatbot: 'Chatbot',
  api: 'Sistema',
  channel_manager: 'Canal de venda',
};

const STATUS_API_PARA_TELA: Record<string, StatusReservaTela> = {
  confirmed: 'Confirmada',
  prereserved: 'Pré-reserva',
  pending_payment: 'Aguardando pagamento',
  checked_in: 'Hospedado',
  blocked: 'Bloqueado',
};

function paraReservaPeriodo(r: ReservaCompletaApi): ReservaPeriodo {
  const total = centavos(r.totals?.total_price);
  const pago = centavos(r.totals?.total_payments);
  return {
    id: r.id,
    codigo: r.booking_code,
    status: STATUS_API_PARA_TELA[r.status] ?? 'Encerrada',
    hospede:
      r.status === 'blocked'
        ? `Bloqueio${r.notes ? `: ${r.notes}` : ''}`
        : (r.guest?.name ?? 'Sem hóspede principal'),
    telefone: r.guest?.phone ?? null,
    quarto: r.rooms[0]?.room?.name ?? null,
    checkin: r.checkin_date,
    checkout: r.checkout_date,
    adultos: r.adults,
    criancas: r.children,
    total,
    pago,
    saldo: Math.round((total - pago) * 100) / 100,
    totalDevido: centavos(r.totals?.total_due),
    origem: r.source?.channel_name ?? ORIGEM_API_PARA_TELA[r.source?.made_by ?? ''] ?? 'Recepção',
  };
}

/**
 * Reservas que se sobrepõem ao período [inicio, fim] (AAAA-MM-DD).
 * Sem canceladas. Inclui os bloqueios de quarto (status Bloqueado).
 */
export async function buscarReservasPeriodo(inicio: string, fim: string): Promise<ReservaPeriodo[]> {
  if (!process.env.LODGEHOG_API_KEY) {
    throw new AppError(503, 'Sistema de reservas não configurado no servidor.');
  }

  const json = await consultar<{ results: ReservaCompletaApi[] }>(
    '/reservations/',
    new URLSearchParams({ checkin_to: fim, checkout_from: inicio, limit: '200' }),
    TTL_RESERVAS_MS,
  );

  return json.results
    .filter((r) => r.status !== 'cancelled')
    .filter((r) => r.checkin_date <= fim && r.checkout_date >= inicio)
    .map(paraReservaPeriodo)
    .sort((a, b) => a.checkin.localeCompare(b.checkin) || (a.quarto ?? '').localeCompare(b.quarto ?? ''));
}

/** Traduz erros de escrita da API para mensagens que a recepção entende. */
function erroDeEscrita(status: number, json: unknown): AppError {
  const erro = (json as { error?: { code?: string; message?: string } })?.error;
  const code = erro?.code ?? '';
  switch (status) {
    case 400:
      return new AppError(400, 'Os dados da reserva não foram aceitos pelo sistema de reservas.');
    case 403:
      return new AppError(403, 'A chave do sistema de reservas não tem permissão para alterar reservas.');
    case 409:
      if (code === 'room_unavailable') return new AppError(409, 'Este quarto não está livre nessas datas.');
      if (code === 'no_availability') return new AppError(409, 'Não há quartos livres nessas datas.');
      if (code === 'managed_by_channel')
        return new AppError(409, 'Esta reserva vem de um canal de venda e precisa ser alterada por lá.');
      return new AppError(409, erro?.message ?? 'A operação conflita com a situação atual da reserva.');
    case 412:
      return new AppError(409, 'A reserva foi alterada por outra pessoa. Atualize a tela e tente de novo.');
    case 422:
      if (code === 'price_unavailable')
        return new AppError(422, 'Não foi possível calcular o preço dessa reserva. Verifique a tarifa da suíte.');
      return new AppError(422, erro?.message ?? 'A reserva não pôde ser salva.');
    case 428:
      return new AppError(428, 'Falta a versão da reserva. Atualize a tela e tente de novo.');
    case 429:
      return new AppError(429, 'Muitas operações seguidas. Aguarde alguns segundos.');
    default:
      return new AppError(502, 'Erro ao gravar no sistema de reservas.');
  }
}

/** Chamada de escrita. Só funciona com uma chave que tenha permissão de escrita. */
async function escrever(
  metodo: 'POST' | 'PATCH' | 'DELETE',
  caminho: string,
  corpo: unknown,
  cabecalhos: Record<string, string> = {},
): Promise<{ json: unknown; etag: string | null }> {
  const chave = process.env.LODGEHOG_API_KEY;
  if (!chave) throw new AppError(503, 'Sistema de reservas não configurado no servidor.');

  await esperarVez();
  let res: Response;
  try {
    res = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${chave}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...cabecalhos,
      },
      body: JSON.stringify(corpo),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new AppError(502, 'Não foi possível falar com o sistema de reservas. Tente de novo.');
  }

  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`[lodgehog] HTTP ${res.status} em ${metodo} ${caminho} (request ${res.headers.get('x-request-id') ?? 'sem-id'})`);
    throw erroDeEscrita(res.status, json);
  }
  limparCacheReservas();
  return { json, etag: res.headers.get('etag') };
}

/** Lê uma reserva e a versão atual dela (ETag), necessária para alterá-la. */
async function buscarReservaComVersao(id: string): Promise<{ reserva: ReservaCompletaApi; etag: string }> {
  const chave = process.env.LODGEHOG_API_KEY;
  if (!chave) throw new AppError(503, 'Sistema de reservas não configurado no servidor.');

  let res: Response;
  try {
    res = await fetch(`${BASE}/reservations/${encodeURIComponent(id)}/`, {
      headers: { Authorization: `Bearer ${chave}`, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new AppError(502, 'Não foi possível falar com o sistema de reservas. Tente de novo.');
  }
  if (res.status === 404) throw new AppError(404, 'Reserva não encontrada.');
  if (!res.ok) throw new AppError(502, 'Erro ao consultar a reserva no sistema de reservas.');

  const etag = res.headers.get('etag');
  if (!etag) throw new AppError(502, 'O sistema de reservas não informou a versão da reserva.');
  return { reserva: (await res.json()) as ReservaCompletaApi, etag };
}

/** Muda o status da reserva (check-in ou check-out), usando a versão atual dela. */
export async function mudarStatusReserva(id: string, status: 'checked_in' | 'checked_out'): Promise<ReservaPeriodo> {
  const { etag } = await buscarReservaComVersao(id);
  const { json } = await escrever(
    'PATCH',
    `/reservations/${encodeURIComponent(id)}/`,
    { status },
    { 'If-Match': etag },
  );
  return paraReservaPeriodo(json as ReservaCompletaApi);
}

export interface EdicaoReservaEntrada {
  checkin: string;
  checkout: string;
  quartoNumero: string;
  adultos: number;
  criancas: number;
  pagamento?: { valor: number; forma: string };
}

/**
 * Altera datas, suíte, ocupação e registra um pagamento antecipado.
 * Ao trocar datas ou suíte, a tarifa é refeita com o plano padrão disponível.
 * Formato de rooms e de pagamentos ainda não confirmado na documentação da API.
 */
export async function atualizarReserva(id: string, e: EdicaoReservaEntrada): Promise<ReservaPeriodo> {
  const { etag } = await buscarReservaComVersao(id);

  const quartos = await consultar<{ id: string; name: string }[]>('/rooms/', new URLSearchParams(), TTL_SALAS_MS);
  const quarto = quartos.find((q) => q.name === e.quartoNumero);
  if (!quarto) throw new AppError(400, `Suíte ${e.quartoNumero} não encontrada no sistema de reservas.`);

  const planos = await buscarCotacao(e.quartoNumero, e.checkin, e.checkout, e.adultos);
  const disponiveis = planos.filter((p) => !p.indisponivel && p.total !== null);
  const plano = disponiveis.find((p) => /padr[aã]o/i.test(p.nome)) ?? disponiveis[0];
  if (!plano) throw new AppError(400, `Sem tarifa disponível para a suíte ${e.quartoNumero} nessas datas.`);

  await escrever(
    'PATCH',
    `/reservations/${encodeURIComponent(id)}/`,
    {
      checkin_date: e.checkin,
      checkout_date: e.checkout,
      rooms: [
        {
          room_id: quarto.id,
          adults: e.adultos,
          children: e.criancas,
          rate_plan_id: plano.id,
        },
      ],
    },
    { 'If-Match': etag },
  );

  if (e.pagamento && e.pagamento.valor > 0) {
    await escrever(
      'POST',
      `/reservations/${encodeURIComponent(id)}/payments/`,
      { value: e.pagamento.valor.toFixed(2), method: e.pagamento.forma },
      { 'Idempotency-Key': randomUUID() },
    );
  }

  const atualizada = await buscarReservaComVersao(id);
  return paraReservaPeriodo(atualizada.reserva);
}

/** Cancela a reserva. O valor 'cancelled' ainda não foi confirmado na documentação da API. */
export async function cancelarReserva(id: string): Promise<ReservaPeriodo> {
  const { etag } = await buscarReservaComVersao(id);
  const { json } = await escrever('PATCH', `/reservations/${encodeURIComponent(id)}/`, { status: 'cancelled' }, { 'If-Match': etag });
  return paraReservaPeriodo(json as ReservaCompletaApi);
}

/** Dados do hóspede no formato da API (CPF ou CNPJ em identity_type/identity_number). */
function montarHospedeApi(h: NovaReservaEntrada['hospede']) {
  return {
    name: h.name,
    email: h.email,
    phone: h.phone,
    identity_type: h.identityType,
    identity_number: h.identityNumber,
  };
}

export interface OcupacaoQuarto {
  numero: string;
  categoria: string | null;
  categoriaId: string | null;
  maxAdultos: number | null;
  maxCriancas: number | null;
  maxPessoas: number | null;
}

/** Primeiro inteiro positivo entre os valores informados (ou null). */
function primeiroNumero(...valores: unknown[]): number | null {
  for (const v of valores) {
    const n = typeof v === 'string' ? Number(v) : v;
    if (typeof n === 'number' && Number.isInteger(n) && n > 0) return n;
  }
  return null;
}

/** Capacidade pelo nome da categoria: "(1 a 3 hóspedes)" ou, pelo tipo, Flex 3, Comfort 4, Individual/Dupla 2. */
function capacidadePelaCategoria(nome: string | null): number | null {
  if (!nome) return null;
  const faixa = nome.match(/(\d+)\s*(?:a|-)\s*(\d+)\s*h[oó]spedes?/i);
  if (faixa) return Number(faixa[2]);
  if (/flex/i.test(nome)) return 3;
  if (/comfort/i.test(nome)) return 4;
  if (/individual|dupla/i.test(nome)) return 2;
  return null;
}

/** Crianças por quarto: no máximo 2, e nunca mais que a capacidade da suíte. */
export const LIMITE_CRIANCAS_POR_QUARTO = 2;

/** Categoria e capacidade de cada suíte, lidas do sistema de reservas (com fallback pelo nome). */
export async function buscarCategoriasQuartos(): Promise<OcupacaoQuarto[]> {
  const quartos = await consultar<(Record<string, unknown> & { name: string; room_category: (Record<string, unknown> & { id: string; name: string }) | null })[]>(
    '/rooms/',
    new URLSearchParams(),
    TTL_SALAS_MS
  );
  return quartos.map((q) => {
    const cat: Record<string, unknown> = q.room_category ?? {};
    const categoria = q.room_category?.name ?? null;
    // Adultos podem ocupar a suíte inteira; crianças são limitadas.
    const pessoas =
      primeiroNumero(q.max_occupancy, q.capacity, cat.max_occupancy, cat.capacity) ?? capacidadePelaCategoria(categoria);
    return {
      numero: q.name,
      categoria,
      categoriaId: q.room_category?.id ?? null,
      maxAdultos: pessoas,
      maxCriancas: pessoas === null ? null : Math.min(LIMITE_CRIANCAS_POR_QUARTO, pessoas),
      maxPessoas: pessoas,
    };
  });
}

const cacheTarifa = new Map<string, { valor: number | null; ate: number }>();
const TEMPO_CACHE_TARIFA_MS = 6 * 60 * 60 * 1000;

/**
 * Tarifa de uma noite para a categoria (2 adultos), vinda da cotação da API.
 * Usa a tarifa padrão quando existir; senão, a primeira disponível. Fica em cache por 6 horas.
 */
export async function tarifaNoite(categoriaId: string, dia: string): Promise<number | null> {
  const chave = `${categoriaId}|${dia}`;
  const hit = cacheTarifa.get(chave);
  if (hit && hit.ate > Date.now()) return hit.valor;

  const amanha = new Date(`${dia}T00:00:00Z`);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const json = await consultar<{
    room_categories: {
      id: string;
      rate_plans: { id: string; name: string; total_with_taxes: string | null; unavailable_reason: string | null }[];
    }[];
  }>(
    '/quote/',
    new URLSearchParams({
      checkin_date: dia,
      checkout_date: amanha.toISOString().slice(0, 10),
      adults: '2',
      room_category: categoriaId,
    }),
    0,
    'tarifa',
  );

  const cat = json.room_categories.find((c) => c.id === categoriaId);
  const disponiveis = (cat?.rate_plans ?? []).filter((p) => p.unavailable_reason === null && p.total_with_taxes !== null);
  const padrao = disponiveis.find((p) => /padr[aã]o/i.test(p.name)) ?? disponiveis[0];
  const valor = padrao ? centavos(padrao.total_with_taxes ?? undefined) : null;
  cacheTarifa.set(chave, { valor, ate: Date.now() + TEMPO_CACHE_TARIFA_MS });
  return valor;
}

/** Remove um bloqueio da suíte, devolvendo as noites à venda. */
export async function desbloquear(id: string): Promise<void> {
  await escrever('DELETE', `/blocks/${encodeURIComponent(id)}/`, undefined, {});
}

export interface NovaReservaEntrada {
  checkin: string;
  checkout: string;
  quartoNumero: string;
  adultos: number;
  criancas: number;
  hospede: { name: string; email?: string; phone?: string; identityType?: 'cpf' | 'cnpj'; identityNumber?: string };
  guestId?: string;
  ratePlanId?: string;
  pagamento?: { valor: number; forma: string };
  observacoes?: string;
  jaCheckIn: boolean;
}

/**
 * Cria uma reserva na pousada. A chave de idempotência faz uma nova tentativa,
 * com o mesmo envio, não criar a reserva duas vezes.
 */
export async function criarReserva(entrada: NovaReservaEntrada, chaveIdempotencia: string): Promise<ReservaPeriodo> {
  const quartos = await consultar<{ id: string; name: string }[]>('/rooms/', new URLSearchParams(), TTL_SALAS_MS);
  const quarto = quartos.find((q) => q.name === entrada.quartoNumero);
  if (!quarto) throw new AppError(400, `Suíte ${entrada.quartoNumero} não encontrada no sistema de reservas.`);

  const { json } = await escrever(
    'POST',
    '/reservations/',
    {
      checkin_date: entrada.checkin,
      checkout_date: entrada.checkout,
      status: entrada.jaCheckIn ? 'checked_in' : 'confirmed',
      guest: entrada.guestId ? undefined : montarHospedeApi(entrada.hospede),
      guest_id: entrada.guestId || undefined,
      rooms: [
        {
          room_id: quarto.id,
          adults: entrada.adultos,
          children: entrada.criancas,
          rate_plan_id: entrada.ratePlanId || undefined,
        },
      ],
      payments: entrada.pagamento
        ? [
            {
              value: entrada.pagamento.valor.toFixed(2),
              method: entrada.pagamento.forma,
            },
          ]
        : undefined,
      notes: entrada.observacoes || undefined,
    },
    { 'Idempotency-Key': chaveIdempotencia },
  );
  return paraReservaPeriodo(json as ReservaCompletaApi);
}

export interface BloqueioEntrada {
  quartoNumero: string;
  checkin: string;
  checkout: string;
  motivo?: string;
}

/** Bloqueia a suíte nas noites de checkin até checkout (checkout é o primeiro dia liberado). */
export async function criarBloqueio(entrada: BloqueioEntrada, chaveIdempotencia: string): Promise<ReservaPeriodo> {
  const quartos = await consultar<{ id: string; name: string }[]>('/rooms/', new URLSearchParams(), TTL_SALAS_MS);
  const quarto = quartos.find((q) => q.name === entrada.quartoNumero);
  if (!quarto) throw new AppError(400, `Suíte ${entrada.quartoNumero} não encontrada no sistema de reservas.`);

  const { json } = await escrever(
    'POST',
    '/blocks/',
    {
      room_id: quarto.id,
      checkin_date: entrada.checkin,
      checkout_date: entrada.checkout,
      notes: entrada.motivo || undefined,
    },
    { 'Idempotency-Key': chaveIdempotencia },
  );
  return paraReservaPeriodo(json as ReservaCompletaApi);
}

/** Valor e tarifas de uma suíte nas datas, a partir da cotação da API. */
export interface PlanoCotacao {
  id: string;
  nome: string;
  total: number | null;
  indisponivel: string | null;
}

export async function buscarCotacao(
  quartoNumero: string,
  checkin: string,
  checkout: string,
  adultos: number,
): Promise<PlanoCotacao[]> {
  const quartos = await consultar<{ id: string; name: string; room_category: { id: string } | null }[]>(
    '/rooms/',
    new URLSearchParams(),
    TTL_SALAS_MS
  );
  const quarto = quartos.find((q) => q.name === quartoNumero);
  if (!quarto?.room_category) throw new AppError(400, `Suíte ${quartoNumero} não encontrada no sistema de reservas.`);

  const json = await consultar<{
    room_categories: {
      id: string;
      rate_plans: {
        id: string;
        name: string;
        total_with_taxes: string | null;
        unavailable_reason: string | null;
      }[];
    }[];
  }>(
    '/quote/',
    new URLSearchParams({
      checkin_date: checkin,
      checkout_date: checkout,
      adults: String(adultos),
      room_category: quarto.room_category.id,
    }),
  );

  const categoria = json.room_categories.find((c) => c.id === quarto.room_category?.id);
  return (categoria?.rate_plans ?? []).map((p) => ({
    id: p.id,
    nome: p.name,
    total: p.total_with_taxes === null ? null : centavos(p.total_with_taxes),
    indisponivel: p.unavailable_reason,
  }));
}
