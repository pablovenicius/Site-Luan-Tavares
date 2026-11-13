// Tela Início: resumo do dia, chegadas e saídas com check-in e check-out, e a situação de cada suíte.
import { useEffect, useState } from 'react';
import {
  ApiError,
  buscarPainel,
  buscarStatusQuartos,
  fazerCheckIn,
  fazerCheckOut,
  type PainelDia,
  type QuartoStatus,
  type ReservaPeriodo,
  type SituacaoQuarto,
} from '../api';
import { dataCurta } from '../utils/data';
import { formatarMoeda, hojeISO } from '../utils/money';
import { DataNav } from './DataNav';

const money = (n: number) => `R$ ${formatarMoeda(n)}`;

const COR_SUITE: Record<SituacaoQuarto, string> = {
  Livre: 'bg-emerald-100 text-emerald-800',
  Ocupado: 'bg-rose-100 text-rose-800',
  'Chegando hoje': 'bg-sky-100 text-sky-800',
  'Saindo hoje': 'bg-amber-100 text-amber-800',
  Bloqueado: 'bg-stone-300 text-stone-800',
};

function Cartao({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">{titulo}</div>
      <div className="mt-1 text-2xl font-bold text-stone-800">{valor}</div>
      {detalhe && <div className="mt-0.5 text-xs text-stone-500">{detalhe}</div>}
    </div>
  );
}

function PagamentoBadge({ r }: { r: ReservaPeriodo }) {
  if (r.saldo <= 0) {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Pago</span>;
  }
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      Falta {money(r.saldo)}
    </span>
  );
}

interface ListaProps {
  titulo: string;
  itens: ReservaPeriodo[];
  vazio: string;
  rotuloAcao?: string;
  podeAgir?: (r: ReservaPeriodo) => boolean;
  onAgir?: (r: ReservaPeriodo) => void;
  ocupado: string | null;
}

function Lista({ titulo, itens, vazio, rotuloAcao, podeAgir, onAgir, ocupado }: ListaProps) {
  return (
    <section className="rounded-2xl border border-stone-200/70 bg-white shadow-card">
      <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="font-bold text-stone-800">{titulo}</h2>
        <span className="text-sm text-stone-500">{itens.length}</span>
      </header>
      {itens.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-stone-500">{vazio}</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {itens.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-[3rem] rounded-md bg-stone-100 px-2 py-1 text-center text-sm font-bold text-stone-700">
                {r.quarto ?? '—'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-stone-800">{r.hospede}</div>
                <div className="text-xs text-stone-500">
                  {r.adultos} adulto(s){r.criancas ? ` · ${r.criancas} criança(s)` : ''} · {r.status}
                </div>
              </div>
              <PagamentoBadge r={r} />
              {onAgir && rotuloAcao && podeAgir?.(r) && (
                <button
                  type="button"
                  onClick={() => onAgir(r)}
                  disabled={ocupado !== null}
                  className="rounded-lg border border-ocean-600 px-3 py-1.5 text-sm font-semibold text-ocean-700 hover:bg-ocean-50 disabled:opacity-50"
                >
                  {ocupado === r.id ? 'Aguarde…' : rotuloAcao}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InicioPainel() {
  const [data, setData] = useState(hojeISO());
  const [painel, setPainel] = useState<PainelDia | null>(null);
  const [quartos, setQuartos] = useState<QuartoStatus[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    Promise.all([buscarPainel(data), buscarStatusQuartos(data)])
      .then(([p, q]) => {
        if (cancelado) return;
        setPainel(p);
        setQuartos(q);
      })
      .catch((err) => {
        if (cancelado) return;
        setPainel(null);
        setQuartos(null);
        setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
      })
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [data, recarga]);

  async function agir(r: ReservaPeriodo, acao: 'checkin' | 'checkout') {
    const pergunta =
      acao === 'checkin'
        ? `Confirmar o check-in de ${r.hospede} na suíte ${r.quarto ?? ''}?`
        : `Confirmar o check-out de ${r.hospede} da suíte ${r.quarto ?? ''}?`;
    if (!window.confirm(pergunta)) return;

    setOcupado(r.id);
    setErro(null);
    try {
      if (acao === 'checkin') await fazerCheckIn(r.id);
      else await fazerCheckOut(r.id);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="space-y-5">
      <DataNav data={data} onMudar={setData} />

      {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
      {carregando && !painel && <p className="text-sm text-stone-500">Carregando…</p>}

      {painel && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Cartao titulo="Ocupados" valor={`${painel.suitesOcupadas}/${painel.suitesTotal}`} detalhe={`${painel.suitesTotal - painel.suitesOcupadas} livre(s)`} />
            <Cartao titulo="Hóspedes esta noite" valor={String(painel.hospedesNoite)} />
            <Cartao titulo="Chegadas" valor={String(painel.chegadas.length)} />
            <Cartao titulo="Saídas" valor={String(painel.saidas.length)} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Lista
              titulo="Chegadas"
              itens={painel.chegadas}
              vazio="Nenhuma chegada neste dia."
              rotuloAcao="Fazer check-in"
              podeAgir={(r) => r.status === 'Confirmada' || r.status === 'Pré-reserva'}
              onAgir={(r) => agir(r, 'checkin')}
              ocupado={ocupado}
            />
            <Lista
              titulo="Saídas"
              itens={painel.saidas}
              vazio="Nenhuma saída neste dia."
              rotuloAcao="Fazer check-out"
              podeAgir={(r) => r.status === 'Hospedado'}
              onAgir={(r) => agir(r, 'checkout')}
              ocupado={ocupado}
            />
          </div>

          {quartos && (
            <section>
              <h2 className="mb-3 font-bold text-stone-800">Suítes</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quartos.map((q) => (
                  <article key={q.numero} className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-stone-800">{q.numero}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COR_SUITE[q.situacao]}`}>{q.situacao}</span>
                    </div>
                    <div className="mt-1 text-sm text-stone-500">
                      {q.nome} · até {q.capacidade} pessoas
                    </div>
                    {q.reserva ? (
                      <div className="mt-3 border-t border-stone-100 pt-3 text-sm">
                        <div className="truncate font-semibold text-stone-800">{q.reserva.hospede}</div>
                        <div className="text-stone-500">
                          {dataCurta(q.reserva.checkin)} a {dataCurta(q.reserva.checkout)} · {q.reserva.adultos + q.reserva.criancas} pessoa(s)
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-400">Sem hóspede neste dia</div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
