// Nome do PDF: "Nome do Cliente - Recibo" ou "Nome do Cliente - Pré-reserva".
/** Tira caracteres proibidos em nomes de arquivo e limita o tamanho. */
function limpar(texto: string): string {
  return texto
    .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
    .trim();
}

/** Nome sem extensão, com acentos (usado no título do PDF e no download). */
export function nomeArquivoRecibo(nomeCliente: string, tipo: string): string {
  const cliente = limpar(nomeCliente) || 'Cliente';
  const sufixo = tipo === 'PRE_RESERVA' ? 'Pré-reserva' : 'Recibo';
  return `${cliente} - ${sufixo}`;
}

/** Versão só ASCII, para o cabeçalho Content-Disposition (navegadores antigos). */
export function nomeArquivoAscii(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '_');
}
