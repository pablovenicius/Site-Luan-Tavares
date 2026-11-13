// Utilidades de máscara e conversão para os campos do formulário.

/**
 * Converte o texto digitado em número.
 * Aceita "150,50" (padrão BR) e "150.50". Retorna 0 se vazio ou inválido.
 */
export function parseMoeda(texto: string): number {
  const t = texto.trim();
  if (!t) return 0;
  const n = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(n) ? n : 0;
}

/** Formata número para exibição: 150.5 → "150,50". */
export const formatarMoeda = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Máscara de CPF ou CNPJ enquanto o usuário digita. */
export function mascaraDocumento(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

/** Data de hoje no fuso local em AAAA-MM-DD (toISOString usa UTC e erraria à noite no Brasil). */
export function hojeISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
