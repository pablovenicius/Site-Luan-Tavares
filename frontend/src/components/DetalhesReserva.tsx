// Janela com os dados completos de uma reserva.
import type { ReservaPeriodo } from '../api';
import { formatarMoeda } from '../utils/money';
import { dataCurta, diasEntre } from '../utils/data';

const money = (n: number) => `R$ ${formatarMoeda(n)}`;

export function DetalhesReserva({ r, onFechar }: { r: ReservaPeriodo; onFechar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4" role="dialog" aria-modal="true">
      <div className="my-8 w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-800">{r.hospede}</h2>
            <p className="text-sm text-stone-500">Suíte {r.quarto ?? '—'} · {r.status}</p>
          </div>
          <button type="button" onClick={onFechar} className="text-stone-400 hover:text-stone-600" aria-label="Fechar">✕</button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-stone-500">Código</dt>
          <dd className="font-semibold text-stone-800">{r.codigo ?? '—'}</dd>
          <dt className="text-stone-500">Origem</dt>
          <dd className="font-semibold text-stone-800">{r.origem}</dd>
          <dt className="text-stone-500">Check-in</dt>
          <dd className="font-semibold text-stone-800">{dataCurta(r.checkin)}</dd>
          <dt className="text-stone-500">Check-out</dt>
          <dd className="font-semibold text-stone-800">{dataCurta(r.checkout)}</dd>
          <dt className="text-stone-500">Duração</dt>
          <dd className="font-semibold text-stone-800">{diasEntre(r.checkin, r.checkout)} noite(s)</dd>
          <dt className="text-stone-500">Pessoas</dt>
          <dd className="font-semibold text-stone-800">
            {r.adultos} adulto(s){r.criancas ? ` · ${r.criancas} criança(s)` : ''}
          </dd>
          <dt className="text-stone-500">Telefone</dt>
          <dd className="font-semibold text-stone-800">{r.telefone ?? '—'}</dd>
          <dt className="text-stone-500">Preço da reserva</dt>
          <dd className="font-semibold text-stone-800">{money(r.total)}</dd>
          <dt className="text-stone-500">Pago</dt>
          <dd className="font-semibold text-ocean-700">{money(r.pago)}</dd>
          <dt className="text-stone-500">Valor que falta receber</dt>
          <dd className={`font-bold ${r.totalDevido > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{money(r.totalDevido)}</dd>
        </dl>
      </div>
    </div>
  );
}
