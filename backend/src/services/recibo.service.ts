// Regras de negócio de recibos e pré-reservas. Toda escrita roda em transação.
import { prisma } from '../lib/prisma';
import type { ReciboInput } from '../schemas/recibo.schema';
import type { ReciboCompleto } from '../types';
import { AppError } from '../utils/AppError';
import { dataUTC, noitesEntre, toCentavos } from '../utils/format';

const INCLUDE = { hospede: true, quarto: true, reserva: true } as const;

/**
 * Cria um recibo (pagamento) ou uma pré-reserva (estadia com sinal).
 * - Upsert do hóspede pelo documento.
 * - Em PRE_RESERVA: confere conflito de datas na suíte e cria a Reserva.
 * - Numeração independente por tipo.
 */
export async function criarRecibo(input: ReciboInput): Promise<ReciboCompleto> {
  return prisma.$transaction(async (tx) => {
    // Sem documento (pré-reserva), o hóspede é criado sem CPF/CNPJ e não entra na busca por documento.
    const { documento, ...dadosHospede } = input.hospede;
    const dados = { ...dadosHospede, documento: documento || null };
    const hospede = documento
      ? await tx.hospede.upsert({ where: { documento }, update: dados, create: dados })
      : await tx.hospede.create({ data: dados });

    let reservaId: number | null = null;
    let quartoId: number | null = input.quartoId ?? null;
    let checkin = input.checkin ? dataUTC(input.checkin) : null;
    let checkout = input.checkout ? dataUTC(input.checkout) : null;

    if (input.tipo === 'PRE_RESERVA') {
      // Validado no schema: quartoId, checkin, checkout, diaria e adultos existem aqui.
      const quarto = await tx.quarto.findUnique({ where: { id: input.quartoId! } });
      if (!quarto) throw new AppError(404, 'Suíte não encontrada');

      const conflito = await tx.reserva.findFirst({
        where: {
          quartoId: quarto.id,
          status: { not: 'CANCELADA' },
          checkin: { lt: checkout! },
          checkout: { gt: checkin! },
        },
      });
      if (conflito) {
        throw new AppError(409, `${quarto.nome} já está reservada nesse período`);
      }

      const diariaCentavos = toCentavos(input.diaria!);
      const noites = noitesEntre(input.checkin!, input.checkout!);

      const reserva = await tx.reserva.create({
        data: {
          status: 'PRE_RESERVA',
          checkin: checkin!,
          checkout: checkout!,
          adultos: input.adultos!,
          criancas: input.criancas,
          diariaCentavos,
          totalCentavos: noites * diariaCentavos,
          hospedeId: hospede.id,
          quartoId: quarto.id,
        },
      });
      reservaId = reserva.id;
      quartoId = quarto.id;
    }

    const { _max } = await tx.recibo.aggregate({
      where: { tipo: input.tipo },
      _max: { numero: true },
    });

    return tx.recibo.create({
      data: {
        numero: (_max.numero ?? 0) + 1,
        tipo: input.tipo,
        valorCentavos: toCentavos(input.valor),
        pagamento: input.pagamento ?? null,
        dataPagamento: input.dataPagamento ? dataUTC(input.dataPagamento) : null,
        referente:
          input.referente ?? (input.tipo === 'PRE_RESERVA' ? 'sinal de reserva' : 'hospedagem'),
        observacoes: input.observacoes ?? null,
        checkin,
        checkout,
        hospedeId: hospede.id,
        quartoId,
        reservaId,
      },
      include: INCLUDE,
    });
  });
}

/** Busca um documento com as relações usadas no PDF. */
export function buscarReciboCompleto(id: number): Promise<ReciboCompleto | null> {
  return prisma.recibo.findUnique({ where: { id }, include: INCLUDE });
}

/** Lista das suítes em ordem numérica. */
export function listarQuartos() {
  return prisma.quarto.findMany({ orderBy: { numero: 'asc' } });
}
