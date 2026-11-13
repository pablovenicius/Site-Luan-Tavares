// Botão que abre a lista de meses do ano. Escolher um mês mostra do primeiro ao último dia.
import { useEffect, useRef, useState } from 'react';

interface Props {
  inicio: string; // AAAA-MM-DD, usado para saber o ano inicial da lista
  onEscolher: (inicio: string, fim: string) => void;
  className?: string;
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function SeletorMes({ inicio, onEscolher, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  // Clique fora da lista de meses fecha a lista.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);
  const [ano, setAno] = useState(Number(inicio.slice(0, 4)));
  const selecionado = inicio.slice(0, 7);

  function abrir() {
    setAno(Number(inicio.slice(0, 4)));
    setAberto((v) => !v);
  }

  function escolher(mes: number) {
    const primeiro = `${ano}-${doisDigitos(mes)}-01`;
    const ultimo = new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10);
    onEscolher(primeiro, ultimo);
    setAberto(false);
  }

  return (
    <div ref={raizRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={abrir}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:border-ocean-500"
      >
        Selecione um mês
      </button>

      {aberto && (
        <>
          <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => setAno(ano - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-stone-600 hover:bg-stone-100" aria-label="Ano anterior">‹</button>
              <span className="text-sm font-bold text-stone-800">{ano}</span>
              <button type="button" onClick={() => setAno(ano + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-stone-600 hover:bg-stone-100" aria-label="Próximo ano">›</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MESES.map((nome, i) => {
                const ativo = `${ano}-${doisDigitos(i + 1)}` === selecionado;
                return (
                  <button
                    key={nome}
                    type="button"
                    onClick={() => escolher(i + 1)}
                    className={`rounded-lg px-2 py-2 text-sm font-semibold ${
                      ativo ? 'bg-ocean-600 text-white' : 'bg-stone-50 text-stone-700 hover:bg-ocean-100'
                    }`}
                  >
                    {nome}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
