// Janela para alterar datas, suíte, ocupação e registrar pagamento antecipado de uma reserva.
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, buscarSuitesLivres, editarReservaOperacao, type ReservaPeriodo, type SuiteLivre } from '../api';
import { diasEntre } from '../utils/data';
import { formatarMoeda, parseMoeda } from '../utils/money';
import { OcupacaoSeletor } from './OcupacaoSeletor';
import { SeletorData } from './SeletorData';

interface Props {
  r: ReservaPeriodo;
  onFechar: () => void;
  onSalvo: () => void;
}

const FORMAS = [
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'cash', rotulo: 'Dinheiro' },
  { valor: 'credit_card', rotulo: 'Cartão de crédito' },
  { valor: 'debit_card', rotulo: 'Cartão de débito' },
  { valor: 'bank_transfer', rotulo: 'Transferência' },
  { valor: 'other', rotulo: 'Outro' },
];

const money = (n: number) => `R$ ${formatarMoeda(n)}`;
const campo = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-ocean-500 focus:outline-none';

export function EditarReservaModal({ r, onFechar, onSalvo }: Props) {
  const [checkin, setCheckin] = useState(r.checkin);
  const [checkout, setCheckout] = useState(r.checkout);
  const [quartoNumero, setQuartoNumero] = useState(r.quarto ?? '');
  const [adultos, setAdultos] = useState(r.adultos);
  const [criancas, setCriancas] = useState(r.criancas);
  const [suites, setSuites] = useState<SuiteLivre[] | null>(null);
  const [valorPago, setValorPago] = useState('');
  const [forma, setForma] = useState('pix');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valido = !!checkin && !!checkout && checkout > checkin;
  const suite = suites?.find((s) => s.numero === quartoNumero) ?? null;
  const pagamentoNum = parseMoeda(valorPago);
  const mudou =
    checkin !== r.checkin || checkout !== r.checkout || quartoNumero !== (r.quarto ?? '') || adultos !== r.adultos || criancas !== r.criancas;
  const alterou = mudou || pagamentoNum > 0;

  // Suítes livres para as datas escolhidas. A própria suíte da reserva conta como livre.
  useEffect(() => {
    if (!valido) return;
    let cancelado = false;
    setSuites(null);
    buscarSuitesLivres(checkin, checkout, r.id)
      .then((lista) => {
        if (!cancelado) setSuites(lista);
      })
      .catch(() => {
        if (!cancelado) setErro('Não foi possível carregar as suítes livres.');
      });
    return () => {
      cancelado = true;
    };
  }, [checkin, checkout, valido, r.id]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!valido) return setErro('A saída precisa ser depois da entrada.');
    if (!quartoNumero) return setErro('Escolha uma suíte.');
    if (suite && (adultos > suite.maxAdultos || criancas > suite.maxCriancas || adultos + criancas > suite.capacidade))
      return setErro(`${suite.nome} acomoda no máximo ${suite.capacidade} hóspedes, com até ${suite.maxCriancas} crianças.`);
    if (!alterou) return setErro('Nada foi alterado.');

    setSalvando(true);
    try {
      await editarReservaOperacao(r.id, {
        checkin,
        checkout,
        quartoNumero,
        adultos,
        criancas,
        pagamento: pagamentoNum > 0 ? { valor: pagamentoNum, forma } : undefined,
      });
      onSalvo();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <form onSubmit={salvar} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-stone-800 shadow-2xl">
        <h2 className="font-display text-2xl font-semibold text-stone-900">Editar reserva</h2>
        <p className="mt-1 text-sm text-stone-600">
          {r.hospede}
          {r.codigo ? ` · reserva ${r.codigo}` : ''}
        </p>

        <div className="mt-5 space-y-4">
          <div className="text-sm text-stone-600">
            <span className="mb-1 block font-semibold">Período da estadia</span>
            <SeletorData modo="periodo" inicio={checkin} fim={checkout} onChange={(i, f) => { setCheckin(i); setCheckout(f); }} />
            {valido && <span className="mt-1 block text-xs text-stone-500">{diasEntre(checkin, checkout)} noite(s)</span>}
          </div>

          <label className="block text-sm text-stone-600">
            <span className="mb-1 block font-semibold">Suíte</span>
            <select className={campo} value={quartoNumero} onChange={(e) => setQuartoNumero(e.target.value)} disabled={!suites}>
              {!suites && <option>Carregando suítes livres…</option>}
              {suites && suites.length === 0 && <option value="">Nenhuma suíte livre nessas datas</option>}
              {suites && quartoNumero && !suites.some((s) => s.numero === quartoNumero) && (
                <option value={quartoNumero}>Suíte {quartoNumero} (indisponível nessas datas)</option>
              )}
              {suites?.map((s) => (
                <option key={s.numero} value={s.numero}>{s.nome} · até {s.capacidade} hóspedes</option>
              ))}
            </select>
          </label>

          <div className="text-sm text-stone-600">
            <span className="mb-1 block font-semibold">Hóspedes</span>
            <OcupacaoSeletor
              adultos={adultos}
              criancas={criancas}
              capacidade={suite?.capacidade ?? null}
              maxCriancas={suite?.maxCriancas ?? 2}
              onChange={(a, c) => { setAdultos(a); setCriancas(c); }}
            />
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h3 className="font-semibold text-stone-800">Pagamento antecipado</h3>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-stone-600">Total da reserva</span>
              <span className="text-right font-semibold">{money(r.total)}</span>
              <span className="text-stone-600">Já pago</span>
              <span className="text-right font-semibold">{money(r.pago)}</span>
              <span className="text-stone-600">Falta receber</span>
              <span className={`text-right font-bold ${r.totalDevido > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{money(r.totalDevido)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm text-stone-600">
                <span className="mb-1 block font-semibold">Valor recebido agora</span>
                <input className={campo} inputMode="decimal" placeholder="R$ 0,00" value={valorPago} onChange={(e) => setValorPago(e.target.value)} />
              </label>
              <label className="block text-sm text-stone-600">
                <span className="mb-1 block font-semibold">Forma</span>
                <select className={campo} value={forma} onChange={(e) => setForma(e.target.value)}>
                  {FORMAS.map((f) => <option key={f.valor} value={f.valor}>{f.rotulo}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>

        {erro && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onFechar} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            Voltar
          </button>
          <button
            type="submit"
            disabled={salvando || !valido || !alterou || !suites}
            className="rounded-lg bg-ocean-600 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-700 disabled:opacity-50"
          >
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
