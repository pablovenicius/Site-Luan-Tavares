// Calendário de um mês: escolha um dia, ou o primeiro e o último dia de um período.
import { useEffect, useRef, useState } from 'react';
import { diasEntre } from '../utils/data';

interface Props {
  modo: 'dia' | 'periodo' | 'mes';
  inicio: string; // AAAA-MM-DD ou ''
  fim?: string; // só no período
  onChange: (inicio: string, fim: string) => void;
  maxDias?: number; // máximo de dias entre o primeiro e o último (período)
  className?: string;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const dataBr = (iso: string) => iso.split('-').reverse().join('/');
const hojeLocal = () => {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
};

/** AAAA-MM deslocado em meses. */
function deslocarMes(mes: string, delta: number): string {
  const [a, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

/** 42 dias (6 semanas) da grade do mês, começando no domingo. */
function gradeDoMes(mes: string): string[] {
  const [a, m] = mes.split('-').map(Number);
  const primeiro = new Date(Date.UTC(a, m - 1, 1));
  const inicio = new Date(primeiro);
  inicio.setUTCDate(1 - primeiro.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio);
    d.setUTCDate(inicio.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Último dia (AAAA-MM-DD) do mês de uma data. */
function ultimoDiaDoMes(iso: string): string {
  const [a, m] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

export function SeletorData({ modo, inicio, fim = '', onChange, maxDias, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  // Clique fora do seletor fecha o calendário.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) fechar();
    };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  });
  const [pendente, setPendente] = useState<string | null>(null); // primeiro dia, aguardando o último
  const [mesVisto, setMesVisto] = useState((inicio || hojeLocal()).slice(0, 7));
  const hoje = hojeLocal();

  const texto =
    modo === 'mes'
      ? inicio ? `${MESES[Number(inicio.slice(5, 7)) - 1]} de ${inicio.slice(0, 4)}` : 'Selecione um mês'
      : modo === 'dia'
        ? inicio ? dataBr(inicio) : 'Escolha a data'
        : inicio && fim ? `${dataBr(inicio)} – ${dataBr(fim)}` : 'Escolha o período';

  // Dias destacados: o pendente (ou o primeiro), e o intervalo entre as pontas.
  const a = modo === 'dia' ? inicio : (pendente ?? inicio);
  const b = modo === 'dia' ? inicio : (pendente ?? fim);
  const lo = a && b ? (a < b ? a : b) : '';
  const hi = a && b ? (a < b ? b : a) : '';

  function abrir() {
    setPendente(null);
    setMesVisto((inicio || hoje).slice(0, 7));
    setAberto((v) => !v);
  }

  function fechar() {
    setAberto(false);
    setPendente(null);
  }

  function clicar(dia: string) {
    if (modo === 'mes') {
      // Qualquer dia escolhe o mês inteiro.
      onChange(`${dia.slice(0, 7)}-01`, ultimoDiaDoMes(dia));
      fechar();
      return;
    }
    if (modo === 'dia') {
      onChange(dia, '');
      fechar();
      return;
    }
    if (pendente === null) {
      setPendente(dia);
      return;
    }
    if (dia < pendente) {
      setPendente(dia);
      return;
    }
    if (maxDias !== undefined && diasEntre(pendente, dia) > maxDias) {
      setPendente(dia);
      return;
    }
    onChange(pendente, dia);
    fechar();
  }

  const [ano, mes] = mesVisto.split('-').map(Number);

  return (
    <div ref={raizRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={abrir}
        className="flex w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2 text-left text-sm text-stone-800 hover:border-ocean-500"
      >
        <span>{texto}</span>
        <span className="text-stone-400">▾</span>
      </button>

      {aberto && (
        <>
          <div className="absolute left-0 z-50 mt-2 w-80 rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => setMesVisto(deslocarMes(mesVisto, -1))} className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-stone-600 hover:bg-stone-100" aria-label="Mês anterior">‹</button>
              <span className="text-sm font-bold text-stone-800">{MESES[mes - 1]} {ano}</span>
              <button type="button" onClick={() => setMesVisto(deslocarMes(mesVisto, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-stone-600 hover:bg-stone-100" aria-label="Próximo mês">›</button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-semibold text-stone-500">
              {DIAS_SEMANA.map((d) => <span key={d} className="py-1">{d}</span>)}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
              {gradeDoMes(mesVisto).map((d) => {
                const doMes = d.slice(0, 7) === mesVisto;
                const ponta = modo === 'mes' ? !!inicio && d.slice(0, 7) === inicio.slice(0, 7) : d === a || d === b;
                const dentro = modo !== 'mes' && !!lo && d >= lo && d <= hi;
                const ehHoje = d === hoje;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => clicar(d)}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm
                      ${ponta ? 'bg-ocean-600 font-bold text-white' : dentro ? 'rounded-none bg-ocean-100 text-ocean-900' : doMes ? 'text-stone-800 hover:bg-stone-100' : 'text-stone-300 hover:bg-stone-50'}
                      ${ehHoje && !ponta ? 'ring-1 ring-ocean-500' : ''}`}
                  >
                    {Number(d.slice(8))}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-stone-500">
              {modo === 'mes'
                ? 'Clique em qualquer dia para ver o mês inteiro.'
                : modo === 'dia'
                ? 'Clique no dia.'
                : pendente
                  ? 'Agora clique no último dia.'
                  : 'Clique no primeiro dia e depois no último.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
