// Tela Reservas: calendário de suítes e lista de reservas do período escolhido.
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiError,
  cancelarReservaOperacao,
  buscarCategoriasQuartos,
  buscarTarifasPeriodo,
  type TarifasPeriodo,
  buscarReservasPeriodo,
  desbloquearOperacao,
  type CategoriaQuarto,
  fazerCheckIn,
  fazerCheckOut,
  listarQuartos,
  type ReservaPeriodo,
} from '../api';
import type { Quarto } from '../types';
import { diasEntre, diaSemana, dataCurta, somarDias } from '../utils/data';
import { SeletorData } from './SeletorData';
import { SeletorMes } from './SeletorMes';
import { formatarMoeda, hojeISO } from '../utils/money';
import { NovaReservaModal } from './NovaReservaModal';
import { BloquearModal } from './BloquearModal';
import { DetalhesReserva } from './DetalhesReserva';
import { EditarReservaModal } from './EditarReservaModal';
import { diasEntre as noitesEntre } from '../utils/data';

const LARGURA_NOME = 180;
const MAX_DIAS = 62;

const COR_STATUS: Record<ReservaPeriodo['status'], string> = {
  Confirmada: 'bg-ocean-500 border-ocean-700 text-white',
  'Pré-reserva': 'bg-violet-500 border-violet-700 text-white',
  'Aguardando pagamento': 'bg-coral-500 border-coral-600 text-white',
  Hospedado: 'bg-sun-500 border-sun-700 text-white',
  Bloqueado: 'bg-stone-300 border-stone-500 text-stone-800',
  Encerrada: 'bg-stone-400 border-stone-600 text-white',
};

/** Posição da dica ao lado do cursor; perto do fim da tela, ela abre para cima. */
function posicaoDica(x: number, y: number) {
  const baixo = y + 320 > window.innerHeight;
  return {
    left: Math.max(8, Math.min(x + 16, window.innerWidth - 300)),
    top: baixo ? y - 16 : y + 16,
    baixo,
  };
}

/** Noites de cada suíte que já estão vendidas ou bloqueadas (datas AAAA-MM-DD). */
function noitesOcupadas(lista: ReservaPeriodo[]): Set<string> {
  const ocupadas = new Set<string>();
  for (const r of lista) {
    for (let d = r.checkin; d < r.checkout; d = somarDias(d, 1)) ocupadas.add(d);
  }
  return ocupadas;
}

const money = (n: number) => `R$ ${formatarMoeda(n)}`;

/** Ícone de pessoa, para indicar a quantidade de hóspedes na reserva. */
function IconePessoa() {
  return (
    <svg viewBox="0 0 24 24" className="inline h-4 w-4 align-[-3px]" fill="currentColor" aria-label="pessoas" role="img">
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 21c0-4.4 3.4-7.5 7.5-7.5s7.5 3.1 7.5 7.5z" />
    </svg>
  );
}

export function ReservasOperacao() {
  // Por padrão a tela mostra hoje + 31 dias e se atualiza sozinha quando o dia vira.
  // Só fica fixa quando a pessoa escolhe um mês no seletor.
  const [hoje, setHoje] = useState(hojeISO());
  const [mesEscolhido, setMesEscolhido] = useState<{ inicio: string; fim: string } | null>(null);
  const inicio = mesEscolhido?.inicio ?? hoje;
  const fim = mesEscolhido?.fim ?? somarDias(hoje, 30);

  useEffect(() => {
    const t = window.setInterval(() => setHoje(hojeISO()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  const [visao, setVisao] = useState<'calendario' | 'lista'>('calendario');
  const [suites, setSuites] = useState<Quarto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaQuarto[]>([]);
  const [tarifas, setTarifas] = useState<TarifasPeriodo>({});
  const [reservas, setReservas] = useState<ReservaPeriodo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [novaAberta, setNovaAberta] = useState(false);
  const [novaInicial, setNovaInicial] = useState<{ quarto: string; checkin: string; checkout: string } | null>(null);
  const [bloqueio, setBloqueio] = useState<{ quarto: string; inicio: string; fim: string } | null>(null);
  const [menu, setMenu] = useState<{ quarto: string; dia: string; x: number; y: number } | null>(null);
  const [menuReserva, setMenuReserva] = useState<{ r: ReservaPeriodo; x: number; y: number } | null>(null);
  const [editando, setEditando] = useState<ReservaPeriodo | null>(null);
  const [detalhe, setDetalhe] = useState<ReservaPeriodo | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);
  // A dica guarda só a reserva; a posição é movida direto no elemento, sem redesenhar a tela a cada movimento do mouse.
  const [dica, setDica] = useState<{ r: ReservaPeriodo } | null>(null);
  const posDica = useRef({ x: 0, y: 0 });
  const dicaRef = useRef<HTMLDivElement>(null);

  const periodoValido = fim >= inicio && diasEntre(inicio, fim) < MAX_DIAS;

  // Tarifa por noite de cada suíte no período (vinda da API de reservas).
  useEffect(() => {
    if (!periodoValido) return;
    let cancelado = false;
    buscarTarifasPeriodo(inicio, fim)
      .then((t) => !cancelado && setTarifas(t))
      .catch(() => !cancelado && setTarifas({}));
    return () => {
      cancelado = true;
    };
  }, [inicio, fim, periodoValido]);

  useEffect(() => {
    listarQuartos().then(setSuites).catch(() => setSuites([]));
    buscarCategoriasQuartos().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!periodoValido) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    buscarReservasPeriodo(inicio, fim)
      .then((lista) => !cancelado && setReservas(lista))
      .catch((err) => {
        if (cancelado) return;
        setReservas(null);
        setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [inicio, fim, periodoValido, recarga]);

  const dias = useMemo(() => {
    if (!periodoValido) return [];
    return Array.from({ length: diasEntre(inicio, fim) + 1 }, (_, i) => somarDias(inicio, i));
  }, [inicio, fim, periodoValido]);

  const [wrapEl, setWrapEl] = useState<HTMLDivElement | null>(null);
  const [larguraWrap, setLarguraWrap] = useState(0);
  useEffect(() => {
    if (!wrapEl) return;
    const ro = new ResizeObserver(([e]) => setLarguraWrap(e.contentRect.width));
    ro.observe(wrapEl);
    return () => ro.disconnect();
  }, [wrapEl]);
  // Os dias dividem a largura da tela; com muitos dias, a tabela rola na horizontal.
  const col = dias.length > 0 && larguraWrap > 0
    ? Math.min(120, Math.max(44, Math.floor((larguraWrap - LARGURA_NOME) / dias.length)))
    : 64;

  const numerosSuite = new Set(suites.map((s) => s.numero));
  const semSuite = (reservas ?? []).filter((r) => !r.quarto || !numerosSuite.has(r.quarto));

  // Suítes agrupadas por categoria, na ordem em que cada categoria aparece.
  const categoriaDo = new Map(categorias.map((c) => [c.numero, c.categoria ?? 'Sem categoria']));
  const grupos: { nome: string; suites: Quarto[] }[] = [];
  for (const s of suites) {
    const nome = categoriaDo.get(s.numero) ?? 'Sem categoria';
    let g = grupos.find((x) => x.nome === nome);
    if (!g) {
      g = { nome, suites: [] };
      grupos.push(g);
    }
    g.suites.push(s);
  }
  type LinhaCal = { chave: string; cabecalho?: string; nome: string; numero: string };
  const linhasCal: LinhaCal[] = [];
  for (const g of grupos) {
    linhasCal.push({ chave: `cat-${g.nome}`, cabecalho: g.nome, nome: '', numero: '' });
    for (const s of g.suites) linhasCal.push({ chave: s.numero, nome: s.nome, numero: s.numero });
  }
  if (semSuite.length) linhasCal.push({ chave: 'sem', nome: 'Sem suíte definida', numero: '' });

  // Reservas por suíte e noites ocupadas, calculadas uma vez por carregamento (não a cada redesenho).
  const reservasPorQuarto = useMemo(() => {
    const m = new Map<string, ReservaPeriodo[]>();
    for (const r of reservas ?? []) {
      if (!r.quarto) continue;
      const lista = m.get(r.quarto);
      if (lista) lista.push(r);
      else m.set(r.quarto, [r]);
    }
    return m;
  }, [reservas]);
  const ocupadasPorQuarto = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const [q, lista] of reservasPorQuarto) m.set(q, noitesOcupadas(lista));
    return m;
  }, [reservasPorQuarto]);

  const campo = 'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700';
  const botaoVisao = (ativo: boolean) =>
    `px-3 py-1.5 text-sm font-semibold ${ativo ? 'bg-ocean-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`;

  const pDica = posicaoDica(posDica.current.x, posDica.current.y);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72 text-sm text-stone-600">
          <span className="mb-1 block font-semibold">Mês</span>
          <SeletorData
            modo="mes"
            inicio={inicio}
            fim={fim}
            onChange={(i, f) => setMesEscolhido({ inicio: i, fim: f })}
          />
        </div>
        <div className="w-44 text-sm text-stone-600">
          <span className="mb-1 block font-semibold">Ir para</span>
          <SeletorMes inicio={inicio} onEscolher={(i, f) => setMesEscolhido({ inicio: i, fim: f })} />
        </div>
        <button
          type="button"
          onClick={() => setNovaAberta(true)}
          className="rounded-lg bg-ocean-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-ocean-700"
        >
          Nova Reserva
        </button>
        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-stone-300">
          <button type="button" className={botaoVisao(visao === 'calendario')} onClick={() => setVisao('calendario')}>
            Calendário
          </button>
          <button type="button" className={botaoVisao(visao === 'lista')} onClick={() => setVisao('lista')}>
            Lista
          </button>
        </div>
      </div>

      {novaAberta && (
        <NovaReservaModal
          dataInicial={novaInicial?.checkin ?? inicio}
          quartoInicial={novaInicial?.quarto}
          checkoutInicial={novaInicial?.checkout}
          onFechar={() => {
            setNovaAberta(false);
            setNovaInicial(null);
          }}
          onCriada={() => {
            setNovaAberta(false);
            setNovaInicial(null);
            setRecarga((n) => n + 1);
          }}
        />
      )}

      {bloqueio && (
        <BloquearModal
          suites={suites}
          quartoInicial={bloqueio.quarto}
          inicio={bloqueio.inicio}
          fim={bloqueio.fim}
          onFechar={() => setBloqueio(null)}
          onBloqueado={() => {
            setBloqueio(null);
            setRecarga((n) => n + 1);
          }}
        />
      )}

      {erroAcao && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroAcao}</div>}

      {menuReserva && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuReserva(null)} />
          <div className="fixed z-50 w-52 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 text-sm shadow-xl" style={{ left: menuReserva.x, top: menuReserva.y }}>
            <div className="border-b border-stone-100 px-3 py-2 text-xs font-semibold text-stone-500">
              {menuReserva.r.hospede}
            </div>
            <button
              type="button"
              className="flex w-full px-3 py-2 text-left font-semibold text-stone-700 hover:bg-stone-100"
              onClick={() => {
                setDetalhe(menuReserva.r);
                setMenuReserva(null);
              }}
            >
              Ver detalhes
            </button>
            {menuReserva.r.status === 'Confirmada' && (
              <button
                type="button"
                disabled={ocupado}
                className="flex w-full px-3 py-2 text-left font-semibold text-ocean-700 hover:bg-ocean-50 disabled:opacity-50"
                onClick={async () => {
                  const r = menuReserva.r;
                  setMenuReserva(null);
                  if (!window.confirm(`Confirmar o check-in de ${r.hospede} na suíte ${r.quarto ?? ''}?`)) return;
                  setOcupado(true);
                  setErroAcao(null);
                  try {
                    await fazerCheckIn(r.id);
                    setRecarga((n) => n + 1);
                  } catch (err) {
                    setErroAcao(err instanceof ApiError ? err.message : 'Falha de conexão.');
                  } finally {
                    setOcupado(false);
                  }
                }}
              >
                Fazer check-in
              </button>
            )}
            {menuReserva.r.status === 'Bloqueado' && (
              <button
                type="button"
                disabled={ocupado}
                className="flex w-full px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                onClick={async () => {
                  const r = menuReserva.r;
                  setMenuReserva(null);
                  if (!window.confirm(`Desbloquear a suíte ${r.quarto ?? ''} nessas datas? Ela volta a ficar à venda.`)) return;
                  setOcupado(true);
                  setErroAcao(null);
                  try {
                    await desbloquearOperacao(r.id);
                    setRecarga((n) => n + 1);
                  } catch (err) {
                    setErroAcao(err instanceof ApiError ? err.message : 'Falha de conexão.');
                  } finally {
                    setOcupado(false);
                  }
                }}
              >
                Desbloquear datas
              </button>
            )}
            {menuReserva.r.status === 'Hospedado' && (
              <button
                type="button"
                disabled={ocupado}
                className="flex w-full px-3 py-2 text-left font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                onClick={async () => {
                  const r = menuReserva.r;
                  setMenuReserva(null);
                  if (!window.confirm(`Confirmar o check-out de ${r.hospede} da suíte ${r.quarto ?? ''}?`)) return;
                  setOcupado(true);
                  setErroAcao(null);
                  try {
                    await fazerCheckOut(r.id);
                    setRecarga((n) => n + 1);
                  } catch (err) {
                    setErroAcao(err instanceof ApiError ? err.message : 'Falha de conexão.');
                  } finally {
                    setOcupado(false);
                  }
                }}
              >
                Fazer check-out
              </button>
            )}
            {!['Bloqueado', 'Encerrada'].includes(menuReserva.r.status) && (
              <>
                <button
                  type="button"
                  disabled={ocupado}
                  className="flex w-full px-3 py-2 text-left font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
                  onClick={() => {
                    setEditando(menuReserva.r);
                    setMenuReserva(null);
                  }}
                >
                  Editar reserva
                </button>
                <button
                  type="button"
                  disabled={ocupado}
                  className="flex w-full px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  onClick={async () => {
                    const r = menuReserva.r;
                    setMenuReserva(null);
                    if (!window.confirm(`Cancelar a reserva de ${r.hospede}${r.quarto ? ` na suíte ${r.quarto}` : ''}? Essa ação não pode ser desfeita pela tela.`)) return;
                    setOcupado(true);
                    setErroAcao(null);
                    try {
                      await cancelarReservaOperacao(r.id);
                      setRecarga((n) => n + 1);
                    } catch (err) {
                      setErroAcao(err instanceof ApiError ? err.message : 'Falha de conexão.');
                    } finally {
                      setOcupado(false);
                    }
                  }}
                >
                  Cancelar reserva
                </button>
              </>
            )}
          </div>
        </>
      )}

      {editando && (
        <EditarReservaModal
          r={editando}
          onFechar={() => setEditando(null)}
          onSalvo={() => {
            setEditando(null);
            setRecarga((n) => n + 1);
          }}
        />
      )}

      {detalhe && <DetalhesReserva r={detalhe} onFechar={() => setDetalhe(null)} />}

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div className="fixed z-50 w-48 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 text-sm shadow-xl" style={{ left: menu.x, top: menu.y }}>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-semibold text-stone-700 hover:bg-ocean-50"
              onClick={() => {
                setNovaInicial({ quarto: menu.quarto, checkin: menu.dia, checkout: somarDias(menu.dia, 1) });
                setNovaAberta(true);
                setMenu(null);
              }}
            >
              Nova reserva
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-semibold text-stone-700 hover:bg-stone-100"
              onClick={() => {
                setBloqueio({ quarto: menu.quarto, inicio: menu.dia, fim: somarDias(menu.dia, 1) });
                setMenu(null);
              }}
            >
              Bloquear datas
            </button>
          </div>
        </>
      )}

      {!periodoValido && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Escolha um período de até {MAX_DIAS} dias, com a data final depois da inicial.
        </div>
      )}
      {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
      {carregando && !reservas && <p className="text-sm text-stone-500">Carregando…</p>}

      {reservas && periodoValido && visao === 'calendario' && (
        <div ref={setWrapEl} className="overflow-x-auto rounded-2xl border border-stone-200/70 bg-white shadow-card">
          <div style={{ minWidth: LARGURA_NOME + dias.length * col }}>
            <div className="flex border-b-2 border-stone-400 bg-stone-50 text-base font-bold text-stone-700">
              <div style={{ width: LARGURA_NOME }} className="shrink-0 border-r-2 border-stone-400 px-3 py-3">Suíte</div>
              {dias.map((d) => (
                <div
                  key={d}
                  style={{ width: col }}
                  className={`shrink-0 border-l-2 border-stone-400 px-1 py-3 text-center ${d === hoje ? 'bg-ocean-100 text-ocean-800' : ''}`}
                >
                  {diaSemana(d)}
                </div>
              ))}
            </div>

            {linhasCal.map((linha) => {
              if (linha.cabecalho) {
                return (
                  <div key={linha.chave} className="border-b border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-600">
                    {linha.cabecalho}
                  </div>
                );
              }
              const deste = linha.numero ? (reservasPorQuarto.get(linha.numero) ?? []) : semSuite;
              const ocupadas = ocupadasPorQuarto.get(linha.numero) ?? new Set<string>();
              const podeReservar = linha.numero !== '';
              return (
                <div key={linha.chave} className="flex border-b-2 border-stone-300 last:border-b-0">
                  <div style={{ width: LARGURA_NOME }} className="shrink-0 border-r-2 border-stone-400 px-3 py-3 text-sm">
                    <div className="text-xl font-bold text-stone-900">{linha.numero || '—'}</div>
                    <div className="truncate text-sm font-medium text-stone-600">{linha.nome}</div>
                  </div>
                  <div className="relative shrink-0" style={{ width: dias.length * col, height: 64 }}>
                    {dias.map((d, i) => {
                      const livre = podeReservar && d >= hoje && !ocupadas.has(d);
                      return (
                        <div
                          key={d}
                          onClick={livre ? (e) => setMenu({ quarto: linha.numero, dia: d, x: e.clientX + 4, y: e.clientY + 4 }) : undefined}
                          className={`group absolute top-0 flex h-full items-center justify-center border-l-2 border-stone-300 ${d === hoje ? 'bg-ocean-50' : ''} ${livre ? 'cursor-pointer hover:bg-ocean-100/70' : ''}`}
                          style={{ left: i * col, width: col }}
                        >
                          {livre && tarifas[linha.numero]?.[d] != null && (
                            <span className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-base font-bold text-ocean-800 group-hover:hidden">
                              R$ {Math.round(tarifas[linha.numero]?.[d] ?? 0)}
                            </span>
                          )}
                          {livre && (
                            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-ocean-600 text-lg font-bold leading-none text-white shadow group-hover:flex">+</span>
                          )}
                        </div>
                      );
                    })}
                    {deste.map((r) => {
                      const inicioIdx = Math.max(0, diasEntre(inicio, r.checkin));
                      const fimIdx = Math.min(dias.length, diasEntre(inicio, r.checkout));
                      if (fimIdx <= inicioIdx) return null;
                      return (
                        <div
                          key={r.id}
                          onMouseEnter={(e) => {
                            posDica.current = { x: e.clientX, y: e.clientY };
                            setDica({ r });
                          }}
                          onMouseMove={(e) => {
                            posDica.current = { x: e.clientX, y: e.clientY };
                            const el = dicaRef.current;
                            if (!el) return;
                            const p = posicaoDica(e.clientX, e.clientY);
                            el.style.left = `${p.left}px`;
                            el.style.top = `${p.top}px`;
                            el.style.transform = p.baixo ? 'translateY(-100%)' : '';
                          }}
                          onMouseLeave={() => setDica(null)}
                          onClick={(e) => {
                            setDica(null);
                            setMenuReserva({ r, x: e.clientX + 4, y: e.clientY + 4 });
                          }}
                          className={`absolute top-2.5 flex h-11 cursor-default items-center overflow-hidden rounded-xl border px-3 text-base font-bold shadow-lg ${COR_STATUS[r.status]}`}
                          style={{ left: inicioIdx * col + 2, width: (fimIdx - inicioIdx) * col - 4 }}
                        >
                          <span className="truncate">
                            {r.hospede} · <IconePessoa /> {r.adultos + r.criancas}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dica && (
        <div
          className="pointer-events-none fixed z-50 w-72 rounded-xl border border-stone-200 bg-white p-4 text-sm shadow-2xl"
          ref={dicaRef}
          style={{ left: pDica.left, top: pDica.top, transform: pDica.baixo ? 'translateY(-100%)' : undefined }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-stone-800">{dica.r.hospede}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COR_STATUS[dica.r.status]}`}>{dica.r.status}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <dt className="text-stone-500">Código</dt>
            <dd className="font-semibold text-stone-800">{dica.r.codigo ?? '—'}</dd>
            <dt className="text-stone-500">Origem</dt>
            <dd className="font-semibold text-stone-800">{dica.r.origem}</dd>
            <dt className="text-stone-500">Pessoas</dt>
            <dd className="font-semibold text-stone-800">
              {dica.r.adultos} adulto(s){dica.r.criancas ? ` · ${dica.r.criancas} criança(s)` : ''}
            </dd>
            <dt className="text-stone-500">Check-in</dt>
            <dd className="font-semibold text-stone-800">{dataCurta(dica.r.checkin)}</dd>
            <dt className="text-stone-500">Check-out</dt>
            <dd className="font-semibold text-stone-800">{dataCurta(dica.r.checkout)}</dd>
            <dt className="text-stone-500">Duração</dt>
            <dd className="font-semibold text-stone-800">
              {noitesEntre(dica.r.checkin, dica.r.checkout)} noite(s)
            </dd>
            <dt className="text-stone-500">Preço da reserva</dt>
            <dd className="font-semibold text-stone-800">{money(dica.r.total)}</dd>
            <dt className="text-stone-500">Valor que falta receber</dt>
            <dd className={`font-bold ${dica.r.totalDevido > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {money(dica.r.totalDevido)}
            </dd>
            <dt className="text-stone-500">Telefone</dt>
            <dd className="font-semibold text-stone-800">{dica.r.telefone ?? '—'}</dd>
          </dl>
        </div>
      )}

      {reservas && periodoValido && visao === 'lista' && (
        <div className="overflow-x-auto rounded-2xl border border-stone-200/70 bg-white shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2">Suíte</th>
                <th className="px-3 py-2">Hóspede</th>
                <th className="px-3 py-2">Check-in</th>
                <th className="px-3 py-2">Check-out</th>
                <th className="px-3 py-2">Pessoas</th>
                <th className="px-3 py-2">Situação</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Pago</th>
                <th className="px-3 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservas.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-stone-500">Nenhuma reserva neste período.</td>
                </tr>
              )}
              {reservas.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-3 py-2 font-semibold">{r.quarto ?? '—'}</td>
                  <td className="px-3 py-2">{r.hospede}</td>
                  <td className="px-3 py-2">{dataCurta(r.checkin)}</td>
                  <td className="px-3 py-2">{dataCurta(r.checkout)}</td>
                  <td className="px-3 py-2">{r.adultos + r.criancas}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${COR_STATUS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2 text-right">{money(r.total)}</td>
                  <td className="px-3 py-2 text-right">{money(r.pago)}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${r.saldo > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{money(r.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
