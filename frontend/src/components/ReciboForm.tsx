// Formulário de emissão de RECIBO ou PRÉ-RESERVA, no layout da pousada.
// Estado tipado por FormState; campos de texto são convertidos para o ReciboPayload no envio.
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ApiError, abrirPdf, baixarImagem, baixarPdf, buscarEstadia, criarDocumento, listarQuartos } from '../api';
import {
  PAGAMENTOS,
  type Pagamento,
  type Quarto,
  type ReciboPayload,
  type TipoDocumento,
  type TipoPessoa,
} from '../types';
import { formatarMoeda, hojeISO, mascaraDocumento, parseMoeda } from '../utils/money';
import { HospedeBusca, type HospedeBuscaItem } from './HospedeBusca';
import { SeletorData } from './SeletorData';
import { nomeArquivoRecibo } from '../utils/nomeArquivo';
import { linkWhatsapp, primeiroNome } from '../utils/whatsapp';
import { linkEmail } from '../utils/email';

/** Abre a caixa de impressão do PDF, sem abrir aba nova. */
function imprimirArquivo(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.src = url;
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(frame);
}

/** Salva um arquivo no computador ou celular. */
function salvarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Todos os campos como texto, como estão no formulário. */
interface FormState {
  tipo: TipoDocumento;
  pessoa: TipoPessoa;
  nome: string;
  documento: string;
  ie: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  valor: string;
  pagamento: Pagamento;
  dataPagamento: string;
  referente: string;
  quartoId: string;
  checkin: string;
  checkout: string;
  adultos: string;
  criancas: string;
  diaria: string;
  observacoes: string;
}

const ESTADO_INICIAL: FormState = {
  tipo: 'PRE_RESERVA',
  pessoa: 'PF',
  nome: '',
  documento: '',
  ie: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: 'Aracaju',
  uf: 'SE',
  cep: '',
  valor: '',
  pagamento: 'PIX',
  dataPagamento: hojeISO(),
  referente: 'Hospedagem',
  quartoId: '',
  checkin: '',
  checkout: '',
  adultos: '2',
  criancas: '0',
  diaria: '',
  observacoes: '',
};

/** Motivos mais usados no campo "Referente a". Um clique preenche; o operador pode digitar outro. */
const OPCOES_REFERENTE = ['Hospedagem', 'Consumo', 'Sinal de reserva', 'Diária extra'];

const inputCls =
  'h-10 rounded-md border border-stone-300 bg-white px-3 text-sm font-normal focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-200';

function Campo({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-semibold text-stone-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-stone-200 pt-5">
      <legend className="mb-3 text-sm font-bold text-ocean-700">{titulo}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">{children}</div>
    </fieldset>
  );
}

export function ReciboForm() {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [emitido, setEmitido] = useState<{ id: number; numero: number; tipo: TipoDocumento; nome: string; email: string; telefone: string } | null>(null);
  const [linkWa, setLinkWa] = useState<string | null>(null);
  const [avisoCopia, setAvisoCopia] = useState<string | null>(null);

  useEffect(() => {
    listarQuartos()
      .then(setQuartos)
      .catch(() => setErros(['Não foi possível carregar as suítes. A API está rodando?']));
  }, []);

  const set = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const pre = form.tipo === 'PRE_RESERVA';

  // Cálculos exibidos ao vivo (o servidor recalcula ao salvar).
  const noites = useMemo(() => {
    if (!form.checkin || !form.checkout) return 0;
    return Math.round((Date.parse(form.checkout) - Date.parse(form.checkin)) / 864e5);
  }, [form.checkin, form.checkout]);
  const diaria = parseMoeda(form.diaria);
  const total = Math.max(noites, 0) * diaria;
  const sinal = parseMoeda(form.valor);
  const restante = Math.max(total - sinal, 0);

  /** Preenche o hóspede com o cadastro escolhido na busca da QuartoVerde. */
  async function preencherHospede(h: HospedeBuscaItem) {
    const d = h.telefone?.replace(/\D/g, '') ?? '';
    // Remove o DDI 55 e formata como (79) 99999-9999
    const tel = d.length === 13 && d.startsWith('55') ? d.slice(2) : d;
    const telFormatado =
      tel.length === 11
        ? tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        : tel.length === 10
          ? tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          : h.telefone ?? '';

    setForm((f) => ({
      ...f,
      pessoa: h.tipo,
      nome: h.nome,
      documento: mascaraDocumento(h.documento),
      telefone: telFormatado,
      email: h.email ?? '',
      endereco: h.endereco ?? '',
      cidade: h.cidade ?? f.cidade,
      uf: h.uf ?? f.uf,
      cep: h.cep ?? '',
    }));
    setErros([]);

    // Estadia (quarto e datas) da reserva atual ou próxima do hóspede.
    try {
      const estadia = await buscarEstadia(h.id);
      if (!estadia) return;
      const quarto = quartos.find((q) => q.numero === estadia.quarto);
      setForm((f) => ({
        ...f,
        quartoId: quarto ? String(quarto.id) : f.quartoId,
        checkin: estadia.checkin,
        checkout: estadia.checkout,
        adultos: String(estadia.adultos),
        criancas: String(estadia.criancas),
        // Diária = total da QuartoVerde ÷ noites; sinal = valor já pago na QuartoVerde.
        diaria: formatarMoeda(estadia.diaria),
        valor: formatarMoeda(estadia.sinal),
      }));
    } catch (err) {
      setErros([err instanceof Error ? err.message : 'Não foi possível buscar a estadia.']);
    }
  }

  /** Trocar entre pré-reserva e recibo começa uma página em branco. */
  function trocarTipo(tipo: TipoDocumento) {
    if (tipo === form.tipo) return;
    setForm({ ...ESTADO_INICIAL, tipo, dataPagamento: hojeISO() });
    setEmitido(null);
    setLinkWa(null);
    setAvisoCopia(null);
    setErros([]);
  }

  /** Limpa o formulário para começar um novo recibo ou pré-reserva. */
  function novoDocumento() {
    setForm({ ...ESTADO_INICIAL, tipo: form.tipo, dataPagamento: hojeISO() });
    setEmitido(null);
    setLinkWa(null);
    setAvisoCopia(null);
    setErros([]);
  }

  /** Copia a imagem do recibo e abre o WhatsApp com o texto. Basta colar (Ctrl+V) e enviar. */
  async function copiarImagem(doc: NonNullable<typeof emitido>) {
    setAvisoCopia(null);
    const nome = nomeArquivoRecibo(doc.nome, doc.tipo);
    const texto = `Olá, ${primeiroNome(doc.nome)}! Segue ${doc.tipo === 'PRE_RESERVA' ? 'a pré-reserva' : 'o recibo'} da Pousada Aruamar:`;
    // O WhatsApp abre só depois de copiar: abrir a aba antes tiraria o foco e a cópia falharia.
    // Nome fixo: o navegador reaproveita a aba do WhatsApp Web se ela já estiver aberta.
    const abrirWhatsapp = () => window.open(linkWhatsapp(doc.telefone, texto), 'whatsapp-web');
    try {
      const blob = await baixarImagem(doc.id);
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        abrirWhatsapp();
        setAvisoCopia('Imagem copiada e WhatsApp Web aberto. Na conversa, clique dentro da caixa "Digite uma mensagem", pressione Ctrl+V (a imagem aparece na prévia) e depois Enter. A imagem não aparece sozinha ao abrir a conversa.');
      } else {
        salvarArquivo(blob, `${nome}.png`);
        abrirWhatsapp();
        setAvisoCopia('Este navegador não copia imagens. A imagem foi baixada: anexe-a na conversa do WhatsApp que acabou de abrir.');
      }
    } catch {
      setErros(['Não foi possível copiar a imagem. Use "Baixar PDF" e anexe o arquivo.']);
    }
  }

  /** Envia o PDF por e-mail. No celular abre o compartilhamento com o arquivo; no computador baixa o PDF e abre o e-mail com o texto. */
  async function enviarEmail(doc: NonNullable<typeof emitido>) {
    const nome = nomeArquivoRecibo(doc.nome, doc.tipo);
    const tipoTxt = doc.tipo === 'PRE_RESERVA' ? 'a pré-reserva' : 'o recibo';
    const assunto = `${doc.tipo === 'PRE_RESERVA' ? 'Pré-reserva' : 'Recibo'} - Pousada Aruamar`;
    const corpo = `Olá, ${primeiroNome(doc.nome)}!\n\nSegue em anexo ${tipoTxt} da Pousada Aruamar.\n\nAté breve!`;
    try {
      const blob = await baixarPdf(doc.id);
      const arquivo = new File([blob], `${nome}.pdf`, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], title: assunto, text: corpo });
        return;
      }
      salvarArquivo(blob, `${nome}.pdf`);
      setLinkWa(linkEmail(doc.email, assunto, corpo));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return; // o usuário cancelou
      setErros(['Não foi possível preparar o PDF para o e-mail.']);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErros([]);
    setEmitido(null);
    setEnviando(true);

    const payload: ReciboPayload = {
      tipo: form.tipo,
      hospede: {
        tipo: form.pessoa,
        nome: form.nome.trim(),
        documento: form.documento,
        ie: form.ie || undefined,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        endereco: form.endereco || undefined,
        cidade: form.cidade || undefined,
        uf: form.uf || undefined,
        cep: form.cep || undefined,
      },
      valor: sinal,
      pagamento: form.pagamento || undefined,
      dataPagamento: form.dataPagamento || undefined,
      referente: form.referente || undefined,
      quartoId: form.quartoId ? Number(form.quartoId) : undefined,
      checkin: form.checkin || undefined,
      checkout: form.checkout || undefined,
      observacoes: form.observacoes || undefined,
      ...(pre
        ? {
            adultos: Number(form.adultos),
            criancas: Number(form.criancas),
            diaria,
          }
        : {}),
    };

    try {
      const res = await criarDocumento(payload);
      setEmitido({ ...res, nome: payload.hospede.nome, email: payload.hospede.email ?? '', telefone: payload.hospede.telefone ?? '' });
      setLinkWa(null);
    } catch (err) {
      if (err instanceof ApiError) {
        const detalhes = Object.values(err.campos).flat();
        setErros(detalhes.length ? detalhes : [err.message]);
      } else {
        setErros(['Falha de conexão com a API.']);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      {/* Abas de tipo de documento */}
      <div role="tablist" className="mb-5 inline-flex rounded-lg bg-stone-100 p-1">
        {(['PRE_RESERVA', 'RECIBO'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={form.tipo === t}
            onClick={() => trocarTipo(t)}
            className={`h-9 rounded-md px-4 text-sm font-semibold transition ${
              form.tipo === t ? 'bg-white text-ocean-700 shadow-sm' : 'text-stone-500'
            }`}
          >
            {t === 'PRE_RESERVA' ? 'Pré-reserva' : 'Recibo'}
          </button>
        ))}
      </div>

      <h1 className="mb-4 text-xl font-medium">
        {pre ? 'Nova pré-reserva' : 'Novo recibo'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Hóspede */}
        {emitido ? (
            <button
              type="button"
              onClick={novoDocumento}
              className="h-10 w-full rounded-md border border-stone-400 bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              {pre ? 'Nova pré-reserva' : 'Novo recibo'}
            </button>
          ) : (
            <HospedeBusca onSelecionar={preencherHospede} />
          )}
        {/* Ações: erros, pós-salvar e Limpar/Salvar, logo abaixo da busca */}
        {/* Erros e sucesso */}
        {erros.length > 0 && (
          <ul role="alert" className="list-disc rounded-lg border border-red-200 bg-red-50 p-3 pl-7 text-sm text-red-700">
            {erros.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
        {emitido && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ocean-200 bg-ocean-50 p-3 text-sm">
            <span>
              {emitido.tipo === 'PRE_RESERVA' ? 'Pré-reserva' : 'Recibo'} Nº {String(emitido.numero).padStart(4, '0')} salvo.
            </span>
            <button
              type="button"
              className="font-semibold text-ocean-700 underline"
              onClick={() => abrirPdf(emitido.id).catch(() => setErros(['Não foi possível abrir o PDF.']))}
            >
              Abrir PDF
            </button>
            <button
              type="button"
              className="font-semibold text-stone-700 underline"
              onClick={() =>
                baixarPdf(emitido.id)
                  .then((blob) => salvarArquivo(blob, `${nomeArquivoRecibo(emitido.nome, emitido.tipo)}.pdf`))
                  .catch(() => setErros(['Não foi possível baixar o PDF.']))
              }
            >
              Baixar PDF
            </button>
            <button
              type="button"
              className="font-semibold text-stone-700 underline"
              onClick={() =>
                baixarPdf(emitido.id)
                  .then(imprimirArquivo)
                  .catch(() => setErros(['Não foi possível imprimir o PDF.']))
              }
            >
              Imprimir
            </button>
            <button
              type="button"
              className="rounded-md bg-[#25d366] px-3 py-1.5 font-semibold text-white hover:bg-[#1ebe5b]"
              onClick={() => copiarImagem(emitido)}
            >
              Copiar para WhatsApp
            </button>
            <button
              type="button"
              className="font-semibold text-stone-700 underline"
              onClick={() => enviarEmail(emitido)}
            >
              Enviar PDF por e-mail
            </button>
            {avisoCopia && (
              <p className="w-full rounded-md bg-ocean-600 px-3 py-2 text-sm font-semibold text-white">{avisoCopia}</p>
            )}
            {linkWa && (
              <p className="w-full text-xs text-stone-600">
                O PDF foi baixado. <a className="font-semibold text-ocean-700 underline" href={linkWa}>Abrir o e-mail</a> e anexe o arquivo.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...ESTADO_INICIAL, tipo: form.tipo, dataPagamento: hojeISO() })}
            className="h-10 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={enviando || emitido !== null}
            className="h-10 rounded-md bg-ocean-600 px-5 text-sm font-bold text-white shadow hover:bg-ocean-700 disabled:opacity-60"
          >
            {enviando ? 'Salvando…' : emitido ? 'Salvo' : 'Salvar'}
          </button>
        </div>
        <Secao titulo="Hóspede">
          <Campo label="Tipo de pessoa">
            <select className={inputCls} value={form.pessoa} onChange={(e) => set('pessoa', e.target.value as TipoPessoa)}>
              <option value="PF">Pessoa física (CPF)</option>
              <option value="PJ">Empresa (CNPJ)</option>
            </select>
          </Campo>
          <Campo label={form.pessoa === 'PJ' ? 'Razão social *' : 'Nome completo *'} className="md:col-span-2">
            <input className={inputCls} required value={form.nome} onChange={(e) => set('nome', e.target.value)} />
          </Campo>
          <Campo label={`${form.pessoa === 'PJ' ? 'CNPJ' : 'CPF'}${form.tipo === 'RECIBO' ? ' *' : ' (opcional)'}`}>
            <input
              className={inputCls}
              required={form.tipo === 'RECIBO'}
              inputMode="numeric"
              placeholder={form.pessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
              value={form.documento}
              onChange={(e) => set('documento', mascaraDocumento(e.target.value))}
            />
          </Campo>
          {form.pessoa === 'PJ' && (
            <Campo label="Inscrição estadual">
              <input className={inputCls} value={form.ie} onChange={(e) => set('ie', e.target.value)} />
            </Campo>
          )}
          <Campo label="Telefone">
            <input className={inputCls} type="tel" placeholder="(79) 99999-9999" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
          </Campo>
          <Campo label="E-mail">
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Campo>
          <Campo label="Endereço" className="md:col-span-3">
            <input className={inputCls} placeholder="Rua, número, bairro" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
          </Campo>
          <Campo label="Cidade">
            <input className={inputCls} value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
          </Campo>
          <Campo label="UF">
            <input className={`${inputCls} uppercase`} maxLength={2} value={form.uf} onChange={(e) => set('uf', e.target.value.toUpperCase())} />
          </Campo>
          <Campo label="CEP">
            <input className={inputCls} inputMode="numeric" placeholder="00000-000" value={form.cep} onChange={(e) => set('cep', e.target.value)} />
          </Campo>
        </Secao>

        {/* Estadia (pré-reserva) */}
        {pre && (
          <Secao titulo="Estadia">
            <Campo label="Suíte *">
              <select className={inputCls} required value={form.quartoId} onChange={(e) => set('quartoId', e.target.value)}>
                <option value="">Selecione…</option>
                {quartos.map((q) => (
                  <option key={q.id} value={q.id}>{q.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Estadia (check-in e check-out) *">
              <SeletorData modo="periodo" inicio={form.checkin} fim={form.checkout} onChange={(i, f) => { set('checkin', i); set('checkout', f); }} />
              <input required tabIndex={-1} className="sr-only" value={form.checkin && form.checkout ? 'ok' : ''} onChange={() => {}} />
            </Campo>
            <Campo label="Adultos *">
              <input className={inputCls} type="number" min={1} max={20} required value={form.adultos} onChange={(e) => set('adultos', e.target.value)} />
            </Campo>
            <Campo label="Crianças">
              <input className={inputCls} type="number" min={0} max={20} value={form.criancas} onChange={(e) => set('criancas', e.target.value)} />
            </Campo>
            <Campo label="Diária (R$) *">
              <input className={inputCls} inputMode="decimal" required placeholder="0,00" value={form.diaria} onChange={(e) => set('diaria', e.target.value)} />
            </Campo>
            <Campo label="Sinal (R$)">
              <input className={inputCls} inputMode="decimal" placeholder="0,00" value={form.valor} onChange={(e) => set('valor', e.target.value)} />
            </Campo>
            <Campo label="Forma do sinal">
              <select className={inputCls} value={form.pagamento} onChange={(e) => set('pagamento', e.target.value as Pagamento)}>
                {PAGAMENTOS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Observações" className="md:col-span-3">
              <textarea className={`${inputCls} h-auto py-2`} rows={2} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} />
            </Campo>
          </Secao>
        )}

        {/* Pagamento (recibo) */}
        {!pre && (
          <Secao titulo="Pagamento">
            <Campo label="Valor recebido (R$) *">
              <input className={`${inputCls} font-bold`} inputMode="decimal" required placeholder="0,00" value={form.valor} onChange={(e) => set('valor', e.target.value)} />
            </Campo>
            <Campo label="Forma de pagamento *">
              <select className={inputCls} required value={form.pagamento} onChange={(e) => set('pagamento', e.target.value as Pagamento)}>
                {PAGAMENTOS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Data do pagamento *">
              <SeletorData modo="dia" inicio={form.dataPagamento} onChange={(i) => set('dataPagamento', i)} />
              <input required tabIndex={-1} className="sr-only" value={form.dataPagamento ? 'ok' : ''} onChange={() => {}} />
            </Campo>
            <div className="flex flex-col gap-1 md:col-span-3">
              <span className="text-sm font-semibold text-stone-700">Referente a *</span>
              <div className="flex flex-wrap gap-2">
                {OPCOES_REFERENTE.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => set('referente', op)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      form.referente === op
                        ? 'border-ocean-600 bg-ocean-600 text-white'
                        : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
              <input
                className={inputCls}
                required
                aria-label="Referente a"
                placeholder="Ou digite outro motivo"
                value={form.referente}
                onChange={(e) => set('referente', e.target.value)}
              />
            </div>
            <Campo label="Suíte (opcional)">
              <select className={inputCls} value={form.quartoId} onChange={(e) => set('quartoId', e.target.value)}>
                <option value="">—</option>
                {quartos.map((q) => (
                  <option key={q.id} value={q.id}>{q.nome}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Estadia (opcional)">
              <SeletorData modo="periodo" inicio={form.checkin} fim={form.checkout} onChange={(i, f) => { set('checkin', i); set('checkout', f); }} />
            </Campo>
          </Secao>
        )}

        {/* Resumo ao vivo */}
        {pre && noites > 0 && (
          <div className="rounded-lg border border-ocean-200 bg-ocean-50 p-3 text-sm">
            {noites} noite(s) × R$ {formatarMoeda(diaria)} = <strong>R$ {formatarMoeda(total)}</strong>
            {' · '}restante após o sinal: <strong>R$ {formatarMoeda(restante)}</strong>
          </div>
        )}

      </form>
    </section>
  );
}
