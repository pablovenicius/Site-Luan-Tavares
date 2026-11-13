// Regras das telas de operação (Início, Quartos, Reservas).
// Cruza as suítes cadastradas no banco com as reservas lidas da API de reservas.
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import {
  buscarCotacao,
  buscarReservasPeriodo,
  criarBloqueio,
  desbloquear,
  buscarCategoriasQuartos,
  tarifaNoite,
  criarReserva,
  mudarStatusReserva,
  type BloqueioEntrada,
  type NovaReservaEntrada,
  type ReservaPeriodo,
} from './lodgehog.service';

/** Uma reserva "dorme" na pousada na noite de `data` se chega até ela e sai depois dela. */
const dormeNoDia = (r: ReservaPeriodo, data: string) => r.checkin <= data && r.checkout > data;
/** A suíte está ocupada no dia se a reserva ainda não saiu (inclui quem sai no próprio dia). */
const ocupaNoDia = (r: ReservaPeriodo, data: string) => r.checkin <= data && r.checkout >= data;
/** Bloqueio não é hóspede: não conta em ocupação nem em chegadas e saídas. */
const ehHospede = (r: ReservaPeriodo) => r.status !== 'Bloqueado';

export async function painelDoDia(data: string) {
  const [totalSuites, todas] = await Promise.all([
    prisma.quarto.count(),
    buscarReservasPeriodo(data, data),
  ]);
  const reservas = todas.filter(ehHospede);

  const ocupadas = reservas.filter((r) => ocupaNoDia(r, data));
  const noite = reservas.filter((r) => dormeNoDia(r, data));

  return {
    data,
    suitesTotal: totalSuites,
    suitesOcupadas: new Set(ocupadas.map((r) => r.quarto)).size,
    hospedesNoite: noite.reduce((soma, r) => soma + r.adultos + r.criancas, 0),
    chegadas: reservas.filter((r) => r.checkin === data),
    saidas: reservas.filter((r) => r.checkout === data),
    hospedados: noite,
  };
}

export type SituacaoQuarto = 'Livre' | 'Ocupado' | 'Chegando hoje' | 'Saindo hoje' | 'Bloqueado';

export async function statusDosQuartos(data: string) {
  const [suites, todas] = await Promise.all([
    prisma.quarto.findMany({ orderBy: { numero: 'asc' } }),
    buscarReservasPeriodo(data, data),
  ]);

  return suites.map((s) => {
    const daSuite = todas.filter((r) => r.quarto === s.numero);
    const ocupante = daSuite.find((r) => ehHospede(r) && ocupaNoDia(r, data));
    const bloqueio = daSuite.find((r) => !ehHospede(r) && dormeNoDia(r, data));

    let situacao: SituacaoQuarto = 'Livre';
    if (ocupante) {
      if (ocupante.checkout === data) situacao = 'Saindo hoje';
      else if (ocupante.checkin === data) situacao = 'Chegando hoje';
      else situacao = 'Ocupado';
    } else if (bloqueio) {
      situacao = 'Bloqueado';
    }

    return {
      numero: s.numero,
      nome: s.nome,
      capacidade: s.capacidade,
      situacao,
      reserva: ocupante ?? bloqueio ?? null,
    };
  });
}

export async function reservasDoPeriodo(inicio: string, fim: string) {
  return buscarReservasPeriodo(inicio, fim);
}

/** Impede reserva com mais adultos ou crianças do que a suíte acomoda. */
async function validarOcupacao(quartoNumero: string, adultos: number, criancas: number) {
  const ocupacao = await buscarCategoriasQuartos();
  const o = ocupacao.find((x) => x.numero === quartoNumero);
  if (!o) return;
  if (o.maxAdultos !== null && adultos > o.maxAdultos)
    throw new AppError(400, `Suíte ${quartoNumero} acomoda no máximo ${o.maxAdultos} adulto(s).`);
  if (o.maxCriancas !== null && criancas > o.maxCriancas)
    throw new AppError(400, `Suíte ${quartoNumero} acomoda no máximo ${o.maxCriancas} criança(s).`);
  if (o.maxPessoas !== null && adultos + criancas > o.maxPessoas)
    throw new AppError(400, `Suíte ${quartoNumero} acomoda no máximo ${o.maxPessoas} pessoas.`);
}

export async function novaReserva(entrada: NovaReservaEntrada, chaveIdempotencia: string) {
  await validarOcupacao(entrada.quartoNumero, entrada.adultos, entrada.criancas);
  return criarReserva(entrada, chaveIdempotencia);
}

export function novoBloqueio(entrada: BloqueioEntrada, chaveIdempotencia: string) {
  return criarBloqueio(entrada, chaveIdempotencia);
}

export function desbloquearSuite(id: string) {
  return desbloquear(id);
}

export function categoriasDosQuartos() {
  return buscarCategoriasQuartos();
}

/**
 * Tarifa de cada suíte em cada noite do período: { numero: { 'AAAA-MM-DD': valor | null } }.
 * Consulta a API em lotes pequenos (limite de chamadas); noites sem valor ficam null.
 */
export async function tarifasDoPeriodo(inicio: string, fim: string) {
  const dias: string[] = [];
  for (let d = new Date(`${inicio}T00:00:00Z`); d.toISOString().slice(0, 10) <= fim; d.setUTCDate(d.getUTCDate() + 1)) {
    dias.push(d.toISOString().slice(0, 10));
  }

  const ocupacao = await buscarCategoriasQuartos();
  const categorias = [...new Set(ocupacao.map((o) => o.categoriaId).filter((c): c is string => !!c))];

  const porCategoria = new Map<string, Record<string, number | null>>();
  for (const cat of categorias) {
    const mapa: Record<string, number | null> = {};
    for (let i = 0; i < dias.length; i += 3) {
      await Promise.all(
        dias.slice(i, i + 3).map(async (dia) => {
          try {
            mapa[dia] = await tarifaNoite(cat, dia);
          } catch {
            mapa[dia] = null;
          }
        }),
      );
    }
    porCategoria.set(cat, mapa);
  }

  const resultado: Record<string, Record<string, number | null>> = {};
  for (const o of ocupacao) {
    const mapa = o.categoriaId ? porCategoria.get(o.categoriaId) : undefined;
    if (mapa) resultado[o.numero] = mapa;
  }
  return resultado;
}

export { atualizarReserva, cancelarReserva } from './lodgehog.service';

export function fazerCheckIn(id: string) {
  return mudarStatusReserva(id, 'checked_in');
}

export function fazerCheckOut(id: string) {
  return mudarStatusReserva(id, 'checked_out');
}

/** Suítes sem reserva nem bloqueio que se sobreponha à estadia [checkin, checkout). */
export async function suitesLivres(checkin: string, checkout: string, ignorarId?: string) {
  const [suites, reservas, ocupacao] = await Promise.all([
    prisma.quarto.findMany({ orderBy: { numero: 'asc' } }),
    buscarReservasPeriodo(checkin, checkout),
    buscarCategoriasQuartos(),
  ]);
  // Ao editar uma reserva, a própria suíte dela conta como livre.
  const ocupadas = new Set(
    reservas
      .filter((r) => r.id !== ignorarId && r.checkin < checkout && r.checkout > checkin)
      .map((r) => r.quarto),
  );
  return suites
    .filter((s) => !ocupadas.has(s.numero))
    .map((s) => {
      const o = ocupacao.find((x) => x.numero === s.numero);
      const pessoas = o?.maxPessoas ?? s.capacidade;
      return {
        numero: s.numero,
        nome: s.nome,
        capacidade: pessoas,
        maxAdultos: o?.maxAdultos ?? pessoas,
        maxCriancas: o?.maxCriancas ?? Math.min(2, pessoas),
      };
    });
}

export function cotacao(quartoNumero: string, checkin: string, checkout: string, adultos: number) {
  return buscarCotacao(quartoNumero, checkin, checkout, adultos);
}
