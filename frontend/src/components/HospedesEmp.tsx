// Tela Hóspedes e Emp.: busca de hóspedes e empresas, com a estadia atual de cada um.
import { useEffect, useState } from 'react';
import {
  ApiError,
  buscarEstadia,
  buscarHospedesLista,
  listarTodosHospedes,
  type EstadiaResposta,
  type HospedeBusca,
} from '../api';
import { dataCurta } from '../utils/data';
import { formatarMoeda } from '../utils/money';

const STATUS_TELA: Record<string, string> = { checked_in: 'Hospedado', confirmed: 'Confirmada' };

export function HospedesEmp() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<HospedeBusca[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [estadia, setEstadia] = useState<EstadiaResposta | null | undefined>(undefined);

  const [todos, setTodos] = useState<HospedeBusca[]>([]);
  const [proximo, setProximo] = useState<string | null>(null);
  const [carregandoTodos, setCarregandoTodos] = useState(false);

  const pesquisavel = termo.trim().length >= 3;

  // Carrega a lista de todos os hóspedes, uma página por vez.
  async function carregarTodos(cursor?: string) {
    setCarregandoTodos(true);
    try {
      const pagina = await listarTodosHospedes(cursor);
      setTodos((atual) => {
        const ids = new Set(atual.map((h) => h.id));
        return [...atual, ...pagina.hospedes.filter((h) => !ids.has(h.id))];
      });
      setProximo(pagina.proximo);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    } finally {
      setCarregandoTodos(false);
    }
  }

  useEffect(() => {
    void carregarTodos();
  }, []);

  const ordenados = [...todos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  useEffect(() => {
    if (!pesquisavel) {
      setResultados([]);
      setErro(null);
      return;
    }
    let cancelado = false;
    const t = setTimeout(() => {
      setCarregando(true);
      setErro(null);
      buscarHospedesLista(termo.trim())
        .then((lista) => !cancelado && setResultados(lista))
        .catch((err) => {
          if (cancelado) return;
          setResultados([]);
          setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
        })
        .finally(() => !cancelado && setCarregando(false));
    }, 400);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [termo, pesquisavel]);

  async function abrirEstadia(id: string) {
    if (abertoId === id) {
      setAbertoId(null);
      return;
    }
    setAbertoId(id);
    setEstadia(undefined);
    try {
      setEstadia(await buscarEstadia(id));
    } catch (err) {
      setEstadia(null);
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão.');
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar por nome, e-mail, CPF ou CNPJ (mínimo 3 caracteres)"
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20"
      />

      {!pesquisavel && termo.length > 0 && <p className="text-sm text-stone-500">Digite pelo menos 3 caracteres.</p>}
      {erro && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</div>}
      {carregando && <p className="text-sm text-stone-500">Buscando…</p>}
      {pesquisavel && !carregando && !erro && resultados.length === 0 && (
        <p className="text-sm text-stone-500">Nenhum hóspede encontrado.</p>
      )}

      {!pesquisavel && (
        <p className="text-sm text-stone-500">
          {todos.length} hóspede(s) carregado(s){proximo ? ' · role para ver mais' : ''}
        </p>
      )}

      <ul className="space-y-3">
        {(pesquisavel ? resultados : ordenados).map((h) => (
          <li key={h.id} className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-bold text-stone-800">{h.nome}</span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-stone-600">
                    {h.tipo === 'PJ' ? 'Empresa' : 'Pessoa'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-stone-500">
                  {[h.documento, h.telefone, h.email].filter(Boolean).join(' · ') || 'Sem contato cadastrado'}
                </div>
                {(h.cidade || h.uf) && (
                  <div className="text-sm text-stone-500">{[h.cidade, h.uf].filter(Boolean).join(' / ')}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => abrirEstadia(h.id)}
                className="rounded-lg border border-ocean-600 px-3 py-1.5 text-sm font-semibold text-ocean-700 hover:bg-ocean-50"
              >
                {abertoId === h.id ? 'Fechar' : 'Ver estadia'}
              </button>
            </div>

            {abertoId === h.id && (
              <div className="mt-3 border-t border-stone-100 pt-3 text-sm">
                {estadia === undefined && <span className="text-stone-500">Carregando…</span>}
                {estadia === null && <span className="text-stone-500">Nenhuma estadia atual ou próxima.</span>}
                {estadia && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                    <div><span className="text-stone-500">Suíte</span><div className="font-semibold">{estadia.quarto ?? '—'}</div></div>
                    <div><span className="text-stone-500">Situação</span><div className="font-semibold">{STATUS_TELA[estadia.status] ?? 'Encerrada'}</div></div>
                    <div><span className="text-stone-500">Check-in</span><div className="font-semibold">{dataCurta(estadia.checkin)}</div></div>
                    <div><span className="text-stone-500">Check-out</span><div className="font-semibold">{dataCurta(estadia.checkout)}</div></div>
                    <div><span className="text-stone-500">Pessoas</span><div className="font-semibold">{estadia.adultos + estadia.criancas}</div></div>
                    <div><span className="text-stone-500">Diária</span><div className="font-semibold">R$ {formatarMoeda(estadia.diaria)}</div></div>
                    <div><span className="text-stone-500">Pago</span><div className="font-semibold">R$ {formatarMoeda(estadia.sinal)}</div></div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {!pesquisavel && proximo && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={carregandoTodos}
            onClick={() => carregarTodos(proximo)}
            className="rounded-lg border border-ocean-600 px-4 py-2 text-sm font-semibold text-ocean-700 hover:bg-ocean-50 disabled:opacity-60"
          >
            {carregandoTodos ? 'Carregando…' : 'Carregar mais hóspedes'}
          </button>
        </div>
      )}
    </div>
  );
}
