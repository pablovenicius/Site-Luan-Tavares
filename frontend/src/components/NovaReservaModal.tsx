// Formulário de nova reserva: hóspede, datas, suíte livre, tarifa, pagamento e resumo.
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  ApiError,
  buscarCotacao,
  buscarHospedesLista,
  buscarSuitesLivres,
  criarReservaOperacao,
  gerarChaveIdempotencia,
  type HospedeBusca,
  type PlanoCotacao,
  type ReservaPeriodo,
  type SuiteLivre,
} from '../api';
import { diasEntre, dataCurta, somarDias } from '../utils/data';
import { OcupacaoSeletor } from './OcupacaoSeletor';
import { SeletorData } from './SeletorData';
import { formatarMoeda, parseMoeda } from '../utils/money';

interface Props {
  dataInicial: string;
  quartoInicial?: string;
  checkoutInicial?: string;
  onFechar: () => void;
  onCriada: (r: ReservaPeriodo) => void;
}

const campo = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20';
const rotulo = 'block text-sm font-semibold text-stone-600';
const money = (n: number) => `R$ ${formatarMoeda(n)}`;

const MOTIVO: Record<string, string> = {
  too_many_guests: 'Não cabe essa quantidade de pessoas',
  min_stay: 'Estadia abaixo do mínimo',
  max_stay: 'Estadia acima do máximo',
  closed_to_arrival: 'Fechada para chegada',
  closed_to_departure: 'Fechada para saída',
  outside_plan_dates: 'Fora do período da tarifa',
  stop_sell: 'Venda fechada nessas datas',
  no_price: 'Sem preço cadastrado',
};

const FORMAS: { valor: string; rotulo: string }[] = [
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'cash', rotulo: 'Dinheiro' },
  { valor: 'credit_card', rotulo: 'Cartão de crédito' },
  { valor: 'debit_card', rotulo: 'Cartão de débito' },
  { valor: 'bank_transfer', rotulo: 'Transferência' },
  { valor: 'other', rotulo: 'Outro' },
];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">{titulo}</h3>
      {children}
    </section>
  );
}

export function NovaReservaModal({ dataInicial, quartoInicial, checkoutInicial, onFechar, onCriada }: Props) {
  const [checkin, setCheckin] = useState(dataInicial);
  const [checkout, setCheckout] = useState(checkoutInicial ?? somarDias(dataInicial, 1));
  const [adultos, setAdultos] = useState(2);
  const [criancas, setCriancas] = useState(0);

  const [suites, setSuites] = useState<SuiteLivre[] | null>(null);
  const [quartoNumero, setQuartoNumero] = useState(quartoInicial ?? '');

  const [planos, setPlanos] = useState<PlanoCotacao[] | null>(null);
  const [planoId, setPlanoId] = useState('');

  const [termo, setTermo] = useState('');
  const [encontrados, setEncontrados] = useState<HospedeBusca[]>([]);
  const [hospede, setHospede] = useState<HospedeBusca | null>(null);
  const [nomeNovo, setNomeNovo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [documento, setDocumento] = useState('');

  const [valorPago, setValorPago] = useState('');
  const [forma, setForma] = useState('pix');

  const [observacoes, setObservacoes] = useState('');
  const [jaCheckIn, setJaCheckIn] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [chave] = useState(() => gerarChaveIdempotencia());

  const datasValidas = checkout > checkin;
  const noites = datasValidas ? diasEntre(checkin, checkout) : 0;

  // Capacidade real da suíte escolhida (adultos, crianças e total).
  const suiteSel = suites?.find((s) => s.numero === quartoNumero) ?? null;
  const maxCriancas = suiteSel?.maxCriancas ?? 2;

  // Ao trocar de suíte, ajusta a ocupação para o que ela acomoda.
  useEffect(() => {
    if (!suiteSel) return;
    const c = Math.min(criancas, suiteSel.maxCriancas, Math.max(0, suiteSel.capacidade - 1));
    const a = Math.min(Math.max(adultos, 1), suiteSel.capacidade - c);
    if (c !== criancas) setCriancas(c);
    if (a !== adultos) setAdultos(a);
  }, [suiteSel?.numero, suiteSel?.capacidade, suiteSel?.maxCriancas]);

  // Suítes livres nas datas escolhidas.
  useEffect(() => {
    if (!datasValidas) return;
    let cancelado = false;
    setSuites(null);
    buscarSuitesLivres(checkin, checkout)
      .then((lista) => {
        if (cancelado) return;
        setSuites(lista);
        setQuartoNumero((atual) => (lista.some((s) => s.numero === atual) ? atual : (lista[0]?.numero ?? '')));
      })
      .catch(() => !cancelado && setSuites([]));
    return () => {
      cancelado = true;
    };
  }, [checkin, checkout, datasValidas]);

  // Tarifas e valor da suíte escolhida.
  useEffect(() => {
    if (!datasValidas || !quartoNumero || adultos < 1) return;
    let cancelado = false;
    setPlanos(null);
    buscarCotacao(quartoNumero, checkin, checkout, adultos)
      .then((lista) => {
        if (cancelado) return;
        setPlanos(lista);
        const primeiro = lista.find((p) => p.indisponivel === null);
        setPlanoId((atual) => (lista.some((p) => p.id === atual && p.indisponivel === null) ? atual : (primeiro?.id ?? '')));
      })
      .catch(() => !cancelado && setPlanos([]));
    return () => {
      cancelado = true;
    };
  }, [quartoNumero, checkin, checkout, adultos, datasValidas]);

  // Busca de hóspedes já cadastrados.
  useEffect(() => {
    if (termo.trim().length < 3) {
      setEncontrados([]);
      return;
    }
    let cancelado = false;
    const t = setTimeout(() => {
      buscarHospedesLista(termo.trim())
        .then((lista) => !cancelado && setEncontrados(lista))
        .catch(() => !cancelado && setEncontrados([]));
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [termo]);

  const planoSel = planos?.find((p) => p.id === planoId) ?? null;
  const total = planoSel?.total ?? null;
  const pagoNum = parseMoeda(valorPago);
  const devido = total === null ? null : Math.round((total - pagoNum) * 100) / 100;
  const nomeHospede = hospede?.nome ?? (nomeNovo.trim() || 'Não informado');

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!hospede && nomeNovo.trim().length < 2) return setErro('Busque um hóspede cadastrado ou informe o nome.');
    if (documento.replace(/\D/g, '') && ![11, 14].includes(documento.replace(/\D/g, '').length)) return setErro('O CPF tem 11 números e o CNPJ, 14. Confira ou deixe em branco.');
    if (!datasValidas) return setErro('A saída precisa ser depois da entrada.');
    if (!quartoNumero) return setErro('Não há suíte livre nessas datas.');
    if (suiteSel && (adultos > suiteSel.maxAdultos || criancas > suiteSel.maxCriancas || adultos + criancas > suiteSel.capacidade))
      return setErro(`${suiteSel.nome} acomoda no máximo ${suiteSel.capacidade} hóspedes, com até ${suiteSel.maxCriancas} crianças.`);
    if (!planoId) return setErro('Escolha uma tarifa disponível.');

    setEnviando(true);
    try {
      const criada = await criarReservaOperacao(
        {
          checkin,
          checkout,
          quartoNumero,
          adultos,
          criancas,
          nome: nomeHospede,
          telefone: hospede ? undefined : telefone.trim() || undefined,
          email: hospede ? undefined : email.trim() || undefined,
          documento: hospede ? undefined : documento.replace(/\D/g, '') || undefined,
          observacoes: observacoes.trim() || undefined,
          jaCheckIn,
          guestId: hospede?.id,
          ratePlanId: planoId,
          pagamento: pagoNum > 0 ? { valor: pagoNum, forma } : undefined,
        },
        chave,
      );
      onCriada(criada);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={enviar} className="my-6 w-full max-w-4xl rounded-xl bg-stone-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3 rounded-t-xl">
          <h2 className="text-lg font-bold text-stone-800">Nova reserva</h2>
          <button type="button" onClick={onFechar} className="text-stone-400 hover:text-stone-600" aria-label="Fechar">✕</button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Secao titulo="Hóspede">
              {hospede ? (
                <div className="flex items-center justify-between rounded-lg border border-ocean-300 bg-ocean-50 px-3 py-2">
                  <div>
                    <div className="font-bold text-stone-800">{hospede.nome}</div>
                    <div className="text-xs text-stone-500">{[hospede.documento, hospede.telefone].filter(Boolean).join(' · ')}</div>
                  </div>
                  <button type="button" onClick={() => setHospede(null)} className="text-sm font-semibold text-ocean-700 hover:underline">
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="search"
                    className={campo}
                    placeholder="Buscar hóspede ou empresa (nome, e-mail, CPF ou CNPJ)"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                  />
                  {encontrados.length > 0 && (
                    <ul className="max-h-48 divide-y divide-stone-100 overflow-y-auto rounded-lg border border-stone-200 bg-white">
                      {encontrados.map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setHospede(h);
                              setTermo('');
                              setEncontrados([]);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-ocean-50"
                          >
                            <div className="font-semibold text-stone-800">{h.nome}</div>
                            <div className="text-xs text-stone-500">{[h.documento, h.telefone, h.email].filter(Boolean).join(' · ')}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <details className="text-sm">
                    <summary className="flex w-full cursor-pointer list-none items-center justify-center gap-3 rounded-xl border-2 border-ocean-600 bg-ocean-600 px-5 py-4 text-lg font-bold text-white shadow-md hover:bg-ocean-700 [&::-webkit-details-marker]:hidden">
                      <span className="text-2xl leading-none">+</span> Cadastrar um novo hóspede
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className={rotulo}>Nome
                        <input className={`${campo} mt-1`} value={nomeNovo} onChange={(e) => setNomeNovo(e.target.value)} />
                      </label>
                      <label className={rotulo}>Telefone
                        <input className={`${campo} mt-1`} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+55 79 99999-9999" />
                      </label>
                      <label className={rotulo}>E-mail
                        <input type="email" className={`${campo} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} />
                      </label>
                      <label className={rotulo}>CPF ou CNPJ (opcional)
                        <input inputMode="numeric" className={`${campo} mt-1`} value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Somente números" />
                      </label>
                    </div>
                  </details>
                </>
              )}
            </Secao>

            <Secao titulo="Estadia">
              <div>
                <span className={rotulo}>Período da estadia (entrada e saída)</span>
                <div className="mt-1">
                  <SeletorData modo="periodo" inicio={checkin} fim={checkout} onChange={(i, f) => { setCheckin(i); setCheckout(f); }} />
                </div>
              </div>
              {!datasValidas && <p className="text-sm text-red-600">A saída precisa ser depois da entrada.</p>}
              {datasValidas && <p className="text-sm text-stone-500">{noites} noite(s) · {dataCurta(checkin)} a {dataCurta(checkout)}</p>}

              <label className={`${rotulo} block`}>Suíte disponível
                <select className={`${campo} mt-1`} value={quartoNumero} onChange={(e) => setQuartoNumero(e.target.value)} disabled={!suites || suites.length === 0}>
                  {!suites && <option>Carregando suítes livres…</option>}
                  {suites && suites.length === 0 && <option value="">Nenhuma suíte livre nessas datas</option>}
                  {suites?.map((s) => (
                    <option key={s.numero} value={s.numero}>{s.nome} · até {s.capacidade} hóspedes</option>
                  ))}
                </select>
              </label>

              <div>
                <span className={rotulo}>Ocupação</span>
                <div className="mt-1">
                  <OcupacaoSeletor
                    adultos={adultos}
                    criancas={criancas}
                    capacidade={suiteSel?.capacidade ?? null}
                    maxCriancas={maxCriancas}
                    onChange={(a, c) => {
                      setAdultos(a);
                      setCriancas(c);
                    }}
                  />
                </div>
              </div>
            </Secao>

            <Secao titulo="Tarifa">
              {!planos && <p className="text-sm text-stone-500">Calculando valores…</p>}
              {planos && planos.length === 0 && <p className="text-sm text-stone-500">Nenhuma tarifa encontrada para essa suíte.</p>}
              {planos && planos.length > 0 && (
                <ul className="space-y-2">
                  {planos.map((p) => {
                    const ok = p.indisponivel === null && p.total !== null;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          disabled={!ok}
                          onClick={() => setPlanoId(p.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                            planoId === p.id ? 'border-ocean-500 bg-ocean-50' : 'border-stone-200 bg-white'
                          } ${ok ? 'hover:border-ocean-400' : 'opacity-50'}`}
                        >
                          <span className="font-semibold text-stone-800">{p.nome}</span>
                          <span className="text-right">
                            {ok && p.total !== null ? (
                              <span className="font-bold text-stone-800">{money(p.total)}</span>
                            ) : (
                              <span className="text-xs text-stone-500">{MOTIVO[p.indisponivel ?? 'no_price'] ?? 'Indisponível'}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Secao>

            <Secao titulo="Pagamento e observações">
              <div className="grid grid-cols-2 gap-3">
                <label className={rotulo}>Valor recebido antecipadamente (R$)
                  <input className={`${campo} mt-1`} inputMode="decimal" value={valorPago} onChange={(e) => setValorPago(e.target.value)} placeholder="0,00" />
                </label>
                <label className={rotulo}>Forma
                  <select className={`${campo} mt-1`} value={forma} onChange={(e) => setForma(e.target.value)}>
                    {FORMAS.map((f) => (
                      <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className={`${rotulo} block`}>Observações
                <textarea rows={2} className={`${campo} mt-1`} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={jaCheckIn} onChange={(e) => setJaCheckIn(e.target.checked)} />
                Já fazer o check-in (hóspede chegou)
              </label>
            </Secao>
          </div>

          <aside className="h-fit space-y-3 rounded-xl border border-stone-200 bg-white p-4 md:sticky md:top-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Resumo</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-stone-500">Hóspede</dt><dd className="truncate font-semibold text-stone-800">{nomeHospede}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-stone-500">Suíte</dt><dd className="font-semibold text-stone-800">{quartoNumero || '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-stone-500">Datas</dt><dd className="font-semibold text-stone-800">{datasValidas ? `${dataCurta(checkin)} a ${dataCurta(checkout)}` : '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-stone-500">Noites</dt><dd className="font-semibold text-stone-800">{noites}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-stone-500">Tarifa</dt><dd className="truncate font-semibold text-stone-800">{planoSel?.nome ?? '—'}</dd></div>
            </dl>
            <div className="border-t border-stone-200 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Total</span><span className="font-bold text-stone-800">{total === null ? '—' : money(total)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Recebido</span><span className="font-semibold text-emerald-700">{money(pagoNum)}</span></div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-stone-100 px-3 py-2">
                <span className="font-semibold text-stone-600">Valor que falta receber</span>
                <span className="text-lg font-bold text-stone-800">{devido === null ? '—' : money(devido)}</span>
              </div>
            </div>
          </aside>
        </div>

        {erro && <div className="mx-5 mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}

        <div className="flex justify-end gap-2 border-t border-stone-200 bg-white px-5 py-3 rounded-b-xl">
          <button type="button" onClick={onFechar} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || !quartoNumero || !planoId}
            className="rounded-lg bg-ocean-600 px-5 py-2 text-sm font-semibold text-white hover:bg-ocean-700 disabled:opacity-50"
          >
            {enviando ? 'Salvando…' : 'Criar reserva'}
          </button>
        </div>
      </form>
    </div>
  );
}
