// Campo de busca de hóspedes e empresas no cadastro da pousada.
// Ao escolher um resultado, chama onSelecionar para preencher o formulário.
import { useEffect, useState } from 'react';
import { buscarHospedes } from '../api';

export interface HospedeBuscaItem {
  id: string;
  tipo: 'PF' | 'PJ';
  nome: string;
  documento: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  empresa: string | null;
}

interface Props {
  onSelecionar: (h: HospedeBuscaItem) => void;
}

const ESPERA_MS = 400; // aguarda a pessoa parar de digitar, para não gastar o limite da API

/** Formata 11 ou 14 dígitos como CPF ou CNPJ, para exibição. */
function formatarDoc(d: string): string {
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return d;
}

export function HospedeBusca({ onSelecionar }: Props) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<HospedeBuscaItem[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const t = termo.trim();
    if (t.length < 3) {
      setResultados([]);
      setErro(null);
      return;
    }

    const controle = new AbortController();
    const timer = setTimeout(async () => {
      setBuscando(true);
      setErro(null);
      try {
        const res = await buscarHospedes(t, controle.signal);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResultados([]);
          setErro(json.erro ?? 'Falha na busca.');
        } else {
          setResultados(json as HospedeBuscaItem[]);
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setErro('Sem conexão com a busca.');
      } finally {
        setBuscando(false);
      }
    }, ESPERA_MS);

    return () => {
      clearTimeout(timer);
      controle.abort();
    };
  }, [termo]);

  function escolher(h: HospedeBuscaItem) {
    onSelecionar(h);
    setTermo('');
    setResultados([]);
    setAberto(false);
  }

  return (
    <div className="relative mb-5">
      <label htmlFor="busca-hospede" className="mb-1.5 block text-[12.5px] font-bold text-stone-700">
        Buscar hóspede ou empresa
      </label>
      <input
        id="busca-hospede"
        type="search"
        autoComplete="off"
        placeholder="Digite nome, e-mail, CPF ou CNPJ…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        onKeyDown={(e) => {
          // Enter aqui não deve enviar o formulário de recibo inteiro
          if (e.key === 'Enter') e.preventDefault();
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-200"
      />

      {aberto && termo.trim().length >= 3 && (
        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-80 overflow-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg">
          {buscando && <li className="p-3 text-sm text-stone-500">Consultando cadastro…</li>}
          {erro && <li className="p-3 text-sm text-red-600">{erro}</li>}
          {!buscando && !erro && resultados.length === 0 && (
            <li className="p-3 text-sm text-stone-500">Nenhum hóspede ou empresa encontrado.</li>
          )}
          {resultados.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // evita o blur antes de selecionar
                  escolher(h);
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-ocean-50"
              >
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                    h.tipo === 'PJ' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {h.tipo === 'PJ' ? 'Empresa' : 'Hóspede'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-stone-800">{h.nome}</span>
                  <span className="block truncate text-xs text-stone-500">
                    {h.documento ? formatarDoc(h.documento) : 'sem documento'}
                    {h.telefone ? ` · ${h.telefone}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
