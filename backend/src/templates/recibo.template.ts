// Monta o HTML do recibo ou da pré-reserva. O PDF é gerado a partir deste HTML.
import fs from 'fs';
import path from 'path';
import { POUSADA } from '../config/pousada';
import type { ReciboCompleto } from '../types';
import { brl, dataBR, esc, noitesEntre } from '../utils/format';
import { valorPorExtenso } from '../utils/extenso';
import { formatarDocumento } from '../utils/validators';
import { nomeArquivoRecibo } from '../utils/nomeArquivo';

// Logo embutida em base64, para o PDF não depender de arquivos externos.
const LOGO = fs
  .readFileSync(path.join(__dirname, '../../assets/logo-aruamar-pdf.jpg'))
  .toString('base64');

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #212529; font-size: 12px; margin: 0; }
  header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #22a04b; padding-bottom: 10px; margin-bottom: 14px; }
  header img { width: 58px; height: 58px; border-radius: 50%; object-fit: cover; }
  header strong { font-size: 16px; color: #1f4f8f; }
  .titulo { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
  .titulo strong { letter-spacing: .04em; }
  .titulo span { color: #1c8a40; font-weight: 700; }
  p { margin: 0 0 12px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
  td { padding: 5px 4px; border-bottom: 1px solid #e9ecef; }
  td.l { color: #6c757d; }
  td.v { text-align: right; font-weight: 600; }
  tr.tot td { font-weight: 800; }
  tr.ok td { color: #1c8a40; font-weight: 700; }
  .valor { background: #f0faf3; border: 1px solid #d3efdb; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; }
  .valor span { font-size: 10px; font-weight: 700; color: #495057; }
  .valor strong { display: block; font-size: 22px; }
  .valor em { font-size: 11px; color: #495057; }
  .box { background: #f0faf3; border: 1px solid #d3efdb; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; }
  .amarelo { background: #fff8e6; border-color: #f5dfa3; }
  .pequeno { font-size: 10px; color: #6c757d; }
  .data { text-align: right; margin-top: 24px; }
  .assinatura { margin-top: 48px; text-align: center; }
  .assinatura div { display: inline-block; border-top: 1px solid #212529; padding: 4px 40px 0; }
`;

export function renderReciboHtml(r: ReciboCompleto): string {
  const pre = r.tipo === 'PRE_RESERVA';
  const cfg = POUSADA;
  const doc = r.hospede.documento
    ? `${r.hospede.tipo === 'PJ' ? 'CNPJ' : 'CPF'} ${formatarDocumento(r.hospede.documento)}`
    : '';
  const numero = String(r.numero).padStart(4, '0');
  const emissao = r.createdAt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const suite = r.quarto?.nome ?? '';
  const periodo = r.checkin && r.checkout ? `${dataBR(r.checkin)} a ${dataBR(r.checkout)}` : '';

  // Linha de tabela. O valor é escapado aqui dentro.
  const linha = (rotulo: string, valor: string) =>
    `<tr><td class="l">${esc(rotulo)}</td><td class="v">${esc(valor)}</td></tr>`;

  const cabecalho = `
    <header>
      <img src="data:image/jpeg;base64,${LOGO}" alt="">
      <div>
        <strong>${esc(cfg.nome)}</strong><br>
        ${esc(cfg.endereco)}${cfg.endereco ? '<br>' : ''}
        ${esc(cfg.cidade)}${cfg.telefone ? ` · ${esc(cfg.telefone)}` : ''}${cfg.email ? ` · ${esc(cfg.email)}` : ''}
      </div>
    </header>`;

  let corpo: string;
  if (pre) {
    const res = r.reserva;
    const noites = res ? noitesEntre(res.checkin.toISOString().slice(0, 10), res.checkout.toISOString().slice(0, 10)) : 0;
    const total = res?.totalCentavos ?? 0;
    const restante = Math.max(total - r.valorCentavos, 0);
    corpo = `
      <p>Olá, <strong>${esc(r.hospede.nome)}</strong>! Confirmamos sua pré-reserva conforme os dados abaixo.</p>
      <table>
        ${linha('Check-in', dataBR(res?.checkin))}
        ${linha('Check-out', dataBR(res?.checkout))}
        ${linha('Noites', String(noites))}
        ${linha('Suíte', suite)}
        ${linha('Hóspedes', `${res?.adultos ?? 0} adulto(s)${res?.criancas ? ` e ${res.criancas} criança(s)` : ''}`)}
        ${linha(`Diária × ${noites}`, brl(res?.diariaCentavos ?? 0))}
        <tr class="tot"><td>Total da estadia</td><td class="v">${brl(total)}</td></tr>
        <tr class="ok"><td>Sinal para confirmar</td><td class="v">${brl(r.valorCentavos)}</td></tr>
        ${linha('Restante no check-in', brl(restante))}
      </table>
      ${cfg.pix ? `<div class="box">Chave PIX para o sinal: <strong>${esc(cfg.pix)}</strong></div>` : ''}
      ${r.observacoes ? `<p><strong>Observações:</strong> ${esc(r.observacoes)}</p>` : ''}
      <p class="pequeno">${esc(cfg.politica)}</p>`;
  } else {
    corpo = `
      <div class="valor">
        <span>VALOR</span>
        <strong>${brl(r.valorCentavos)}</strong>
        <em>(${esc(valorPorExtenso(r.valorCentavos))})</em>
      </div>
      <p>
        Recebemos de <strong>${esc(r.hospede.nome)}</strong>, ${esc(doc)},
        a importância de <strong>${brl(r.valorCentavos)}</strong>, referente a ${esc(r.referente)}.
      </p>
      <table>
        ${linha('Pagamento', `${r.pagamento ?? '—'} · ${dataBR(r.dataPagamento)}`)}
        ${periodo ? linha('Período', periodo) : ''}
        ${suite ? linha('Suíte', suite) : ''}
        ${r.observacoes ? linha('Observações', r.observacoes) : ''}
      </table>
      <p>Para clareza, firmamos o presente recibo.</p>`;
  }

  const rodape = `
    <p class="data">${esc(cfg.cidade.split('/')[0])}, ${esc(emissao)}.</p>
    ${pre ? '' : `<div class="assinatura"><div>${esc(cfg.nome)}${cfg.cnpj ? `<br>CNPJ ${esc(formatarDocumento(cfg.cnpj))}` : ''}</div></div>`}`;

  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${esc(nomeArquivoRecibo(r.hospede.nome, r.tipo))}</title><style>${CSS}</style></head>
<body>
  ${cabecalho}
  <div class="titulo">
    <strong>${pre ? 'PRÉ-RESERVA' : 'RECIBO'}</strong>
    <span>Nº ${numero}</span>
  </div>
  ${corpo}
  ${rodape}
</body>
</html>`;
}
