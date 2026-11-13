import { useState } from 'react';
import { ReciboForm } from './components/ReciboForm';
import { InicioPainel } from './components/InicioPainel';
import { ReservasOperacao } from './components/ReservasOperacao';
import { HospedesEmp } from './components/HospedesEmp';
import { LoginPage } from './components/LoginPage';
import { sair, temSessao } from './api';

type Aba = 'reservas' | 'inicio' | 'hospedes' | 'recibos';

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'reservas', rotulo: 'Reservas' },
  { id: 'inicio', rotulo: 'Quartos' },
  { id: 'hospedes', rotulo: 'Hóspedes e Emp.' },
  { id: 'recibos', rotulo: 'Recibos e pré-reservas' },
];

export default function App() {
  const [logado, setLogado] = useState(temSessao());
  const [aba, setAba] = useState<Aba>('reservas');
  // Cada clique em uma aba aumenta esta versão, e a tela da aba é recriada e busca os dados de novo.
  const [versao, setVersao] = useState(0);

  if (!logado) {
    return <LoginPage onEntrou={() => setLogado(true)} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header
        className={`sticky top-0 z-30 text-white shadow-lg ${
          aba === 'reservas'
            ? 'bg-gradient-to-r from-sun-800 via-sun-700 to-sun-600'
            : 'bg-gradient-to-r from-ocean-900 via-ocean-700 to-ocean-600'
        }`}
      >
        <div className="flex w-full items-center gap-x-4 px-4 py-2 md:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <img src="/logo-aruamar.jpg" alt="Logo Pousada Aruamar" className="h-14 w-14 rounded-full object-cover shadow ring-2 ring-white/70" />
            <div className="font-display text-2xl font-semibold leading-tight text-white">Pousada Aruamar</div>
          </div>

          <nav className="flex min-w-0 flex-1 items-center justify-around gap-2 overflow-x-auto">
            {ABAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setAba(a.id);
                  setVersao((v) => v + 1);
                }}
                className={`shrink-0 border-b-4 px-4 py-2 text-xl font-bold md:text-2xl ${
                  aba === a.id ? 'border-white text-white' : 'border-transparent text-white/80 hover:text-white'
                }`}
              >
                {a.rotulo}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              sair();
              setLogado(false);
            }}
            className="shrink-0 rounded-lg border border-white/50 px-4 py-2 text-base font-semibold text-white hover:bg-white/10"
          >
            Sair
          </button>
        </div>
      </header>

      <main className={`mx-auto p-4 md:p-6 ${aba === 'reservas' ? 'max-w-none' : 'max-w-7xl'}`}>
        {aba === 'inicio' && <InicioPainel key={versao} />}
        {aba === 'reservas' && <ReservasOperacao key={versao} />}
        {aba === 'hospedes' && <HospedesEmp key={versao} />}
        {aba === 'recibos' && <ReciboForm key={versao} />}
      </main>
    </div>
  );
}
