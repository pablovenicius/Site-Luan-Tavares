// Tela de entrada do sistema da Pousada Aruamar. Layout inspirado na tela de login da QuartoVerde.
import { useState, type FormEvent } from 'react';
import { ApiError, entrar } from '../api';

const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-200';

export function LoginPage({ onEntrou }: { onEntrou: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      onEntrou();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha de conexão. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: '#c4efbd' }}
    >
      {/* Círculos de fundo, como na tela da QuartoVerde */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[1500px] w-[1500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, #e6f6e2 0%, #d6f0d1 60%, #c4efbd 100%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[710px] w-[710px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: '#e8f6e6' }}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <img src="/logo-aruamar.jpg" alt="Logo Pousada Aruamar" className="h-20 w-20 rounded-full object-cover" />
          <div className="text-xl font-bold text-ocean-700">Pousada Aruamar</div>
          <div className="text-xs text-stone-500">Recibos e pré-reservas</div>
        </div>

        <Divisor />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-stone-800">
              E-mail *
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-semibold text-stone-800">
              Senha *
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              className={inputCls}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-center text-sm text-red-700">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-[#17a34a] py-3 font-semibold text-white shadow hover:bg-[#15913f] disabled:opacity-60"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <Divisor />

        <button
          type="button"
          onClick={() => setAviso('Login com Google ainda não está configurado nesta pousada.')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          <GoogleIcone />
          Continuar com Google
        </button>

        {aviso && <p className="mt-3 text-center text-xs text-stone-500">{aviso}</p>}
      </div>
    </div>
  );
}

function Divisor() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
      <div className="h-px flex-1 bg-stone-200" />
      OU
      <div className="h-px flex-1 bg-stone-200" />
    </div>
  );
}

function GoogleIcone() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.7-4-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
