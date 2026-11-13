// Navegação de data (anterior, hoje, próximo) reutilizada pelas telas de operação.
import { dataExtensa, somarDias } from '../utils/data';
import { hojeISO } from '../utils/money';

interface Props {
  data: string;
  onMudar: (nova: string) => void;
  rotulo?: (iso: string) => string;
}

export function DataNav({ data, onMudar, rotulo = dataExtensa }: Props) {
  const hoje = hojeISO();
  const botao = 'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-50';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={botao} onClick={() => onMudar(somarDias(data, -1))} aria-label="Dia anterior">
        ‹
      </button>
      <span className="min-w-[14rem] text-center text-lg font-bold text-stone-800">{rotulo(data)}</span>
      <button type="button" className={botao} onClick={() => onMudar(somarDias(data, 1))} aria-label="Próximo dia">
        ›
      </button>
      {data !== hoje && (
        <button type="button" className={botao} onClick={() => onMudar(hoje)}>
          Hoje
        </button>
      )}
    </div>
  );
}
