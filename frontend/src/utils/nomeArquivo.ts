// Nome do PDF: "Nome do Cliente - Recibo" ou "Nome do Cliente - Pré-reserva".

/** Tira caracteres proibidos em nomes de arquivo e limita o tamanho. */
export function nomeArquivoRecibo(nomeCliente: string, tipo: 'RECIBO' | 'PRE_RESERVA'): string {
  const cliente =
    nomeCliente
      .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100)
      .trim() || 'Cliente';
  return `${cliente} - ${tipo === 'PRE_RESERVA' ? 'Pré-reserva' : 'Recibo'}`;
}
