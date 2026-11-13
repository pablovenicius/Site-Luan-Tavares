// Seletor de ocupação: adultos e crianças, limitados pela capacidade da suíte.
import { useState } from 'react';

interface Props {
  adultos: number;
  criancas: number;
  capacidade: number | null; // total de hóspedes que a suíte acomoda
  maxCriancas: number;
  onChange: (adultos: number, criancas: number) => void;
}

export function OcupacaoSeletor({ adultos, criancas, capacidade, maxCriancas, onChange }: Props) {
  const [aberto, setAberto] = useState(false);
  const semSuite = capacidade === null;
  const total = capacidade ?? 0;
  const maxAdultos = Math.max(1, total - criancas);
  const maxCriancasAgora = Math.max(0, Math.min(maxCriancas, total - adultos));

  const resumo = semSuite
    ? 'Escolha a suíte primeiro'
    : `${adultos} adulto${adultos === 1 ? '' : 's'} · ${criancas} criança${criancas === 1 ? '' : 's'}`;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={semSuite}
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2 text-left text-sm text-stone-800 hover:border-ocean-500 disabled:opacity-60"
      >
        <span>{resumo}</span>
        <span className="text-stone-400">▾</span>
      </button>

      {aberto && !semSuite && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
            <Linha rotulo="Adultos" valor={adultos} min={1} max={maxAdultos} onChange={(v) => onChange(v, criancas)} />
            <Linha rotulo="Crianças" valor={criancas} min={0} max={maxCriancasAgora} onChange={(v) => onChange(adultos, v)} />
            <p className="mt-2 text-xs text-stone-500">
              A suíte acomoda até {total} hóspedes, com no máximo {maxCriancas} crianças.
            </p>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="mt-3 w-full rounded-lg bg-ocean-600 px-3 py-2 text-sm font-semibold text-white hover:bg-ocean-700"
            >
              Concluído
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Linha({ rotulo, valor, min, max, onChange }: { rotulo: string; valor: number; min: number; max: number; onChange: (v: number) => void }) {
  const botao = 'flex h-8 w-8 items-center justify-center rounded-full border border-ocean-500 text-lg leading-none text-ocean-700 hover:bg-ocean-50 disabled:opacity-30';
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-semibold text-stone-700">{rotulo}</span>
      <div className="flex items-center gap-3">
        <button type="button" disabled={valor <= min} onClick={() => onChange(valor - 1)} className={botao} aria-label={`Diminuir ${rotulo.toLowerCase()}`}>−</button>
        <span className="w-6 text-center text-sm font-bold text-stone-800">{valor}</span>
        <button type="button" disabled={valor >= max} onClick={() => onChange(valor + 1)} className={botao} aria-label={`Aumentar ${rotulo.toLowerCase()}`}>+</button>
      </div>
    </div>
  );
}
