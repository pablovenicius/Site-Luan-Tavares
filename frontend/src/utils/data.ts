// Utilidades de data em AAAA-MM-DD, sem depender do fuso do navegador.

/** Soma dias a uma data AAAA-MM-DD. */
export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Diferença em dias entre duas datas AAAA-MM-DD (b - a). */
export function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
}

/** AAAA-MM-DD → DD/MM. */
export const dataCurta = (iso: string) => iso.split('-').reverse().slice(0, 2).join('/');

/** AAAA-MM-DD → "Ter., 10/11". */
export function diaSemana(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const nome = new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' });
  return `${nome.replace('.', '')} ${dataCurta(iso)}`;
}

/** AAAA-MM-DD → "Terça-feira, 10/11/2026". */
export function dataExtensa(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const nome = new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}, ${dataCurta(iso)}/${a}`;
}
