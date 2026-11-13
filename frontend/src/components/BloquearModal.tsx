// Formulário para bloquear uma suíte em um período (manutenção, uso próprio etc.).
import { useState, type FormEvent } from 'react';
import { ApiError, criarBloqueioOperacao, gerarChaveIdempotencia, type ReservaPeriodo } from '../api';
import type { Quarto } from '../types';
import { somarDias } from '../utils/data';
import { SeletorData } from './SeletorData';

interface Props {
  suites: Quarto[];
  quartoInicial: string;
  inicio: string;
  fim: string;
  onFechar: () => void;
  onBloqueado: (r: ReservaPeriodo) => void;
}

const campo = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20';
const rotulo = 'block text-sm font-semibold text-stone-600';

export function BloquearModal({ suites, quartoInicial, inicio, fim, onFechar, onBloqueado }: Props) {
  const [quartoNumero, setQuartoNumero] = useState(quartoInicial);
  const [checkin, setCheckin] = useState(inicio);
  const [checkout, setCheckout] = useState(fim || somarDias(inicio, 1));
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [chave] = useState(() => gerarChaveIdempotencia());

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (checkout <= checkin) return setErro('O fim do bloqueio precisa ser depois do início.');

    setEnviando(true);
    try {
      const criado = await criarBloqueioOperacao(
        { quartoNumero, checkin, checkout, motivo: motivo.trim() || undefined },
        chave,
      );
      onBloqueado(criado);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={enviar} className="my-8 w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800">Bloquear datas</h2>
          <button type="button" onClick={onFechar} className="text-stone-400 hover:text-stone-600" aria-label="Fechar">✕</button>
        </div>

        <label className={`${rotulo} block`}>Suíte
          <select className={`${campo} mt-1`} value={quartoNumero} onChange={(e) => setQuartoNumero(e.target.value)}>
            {suites.map((s) => (
              <option key={s.numero} value={s.numero}>{s.nome}</option>
            ))}
          </select>
        </label>

        <div>
          <span className={rotulo}>Período bloqueado (primeira e última noite)</span>
          <div className="mt-1">
            <SeletorData modo="periodo" inicio={checkin} fim={somarDias(checkout, -1)} onChange={(i, f) => { setCheckin(i); setCheckout(somarDias(f, 1)); }} />
          </div>
        </div>

        <label className={`${rotulo} block`}>Motivo (opcional)
          <input className={`${campo} mt-1`} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: pintura" />
        </label>

        {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFechar} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60">
            {enviando ? 'Bloqueando…' : 'Bloquear'}
          </button>
        </div>
      </form>
    </div>
  );
}
