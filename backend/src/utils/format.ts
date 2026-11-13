// Conversões de valor, data e escape para HTML.

/** Converte reais (ex.: 150.5) para centavos inteiros (15050). */
export const toCentavos = (reais: number) => Math.round(reais * 100);

/** Formata centavos como moeda brasileira (15050 → "R$ 150,50"). */
export const brl = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "AAAA-MM-DD" → Date em UTC, meia-noite. Evita deslocamento de fuso. */
export const dataUTC = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

/** Date → "DD/MM/AAAA". */
export const dataBR = (d?: Date | null) =>
  d ? d.toISOString().slice(0, 10).split('-').reverse().join('/') : '—';

/** Número de noites entre duas datas "AAAA-MM-DD". */
export const noitesEntre = (checkin: string, checkout: string) =>
  Math.round((dataUTC(checkout).getTime() - dataUTC(checkin).getTime()) / 864e5);

/** Escapa texto para uso seguro dentro de HTML. */
export const esc = (valor: unknown) =>
  String(valor ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
