"use client";

import { useEffect, useRef, useState } from "react";
import { IconChart, IconChat, IconCheck, IconDumbbell, IconPlay } from "@/components/icons";

type Tab = "treino" | "video" | "evolucao" | "chat";

const exercicios = [
  { nome: "Supino reto", series: "4 × 10", dicas: ["Escápulas firmes no banco", "Cotovelos a 45° do tronco", "Desça controlando, 2 segundos"] },
  { nome: "Crucifixo inclinado", series: "3 × 12", dicas: ["Cotovelos levemente flexionados", "Abra até sentir o peitoral alongar", "Suba sem bater as mãos"] },
  { nome: "Tríceps na polia", series: "3 × 12", dicas: ["Cotovelos colados ao corpo", "Estenda por completo", "Volte devagar"] },
  { nome: "Flexão de braço", series: "3 × 15", dicas: ["Corpo alinhado da cabeça aos pés", "Abdômen firme", "Peito perto do chão"] },
];

const semanas = [38, 46, 52, 61, 70, 82];

const respostas: Record<string, string> = {
  "Foi ótimo!": "Boa! Vou subir um pouco a carga no próximo treino.",
  "Senti dor no ombro": "Vou ajustar o exercício. Se a dor persistir, procure liberação médica.",
  "Posso trocar um exercício?": "Claro! Me diz qual e eu monto uma alternativa para você.",
};

type Msg = { de: "luan" | "aluno"; texto: string };

const abas: { id: Tab; rotulo: string; Icon: typeof IconDumbbell }[] = [
  { id: "treino", rotulo: "Treino", Icon: IconDumbbell },
  { id: "video", rotulo: "Vídeo", Icon: IconPlay },
  { id: "evolucao", rotulo: "Evolução", Icon: IconChart },
  { id: "chat", rotulo: "Luan", Icon: IconChat },
];

/** Aplicativo de treino ilustrado em uma moldura de celular. É interativo: toque nas funções. */
export function AppMockup({ className = "" }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("treino");
  const [feitos, setFeitos] = useState<boolean[]>([true, true, false, false]);
  const [sel, setSel] = useState(2);
  const [tocando, setTocando] = useState(false);
  const [prog, setProg] = useState(0);
  const [semana, setSemana] = useState(5);
  const [msgs, setMsgs] = useState<Msg[]>([{ de: "luan", texto: "Oi! Como foi o treino de ontem?" }]);
  const [usadas, setUsadas] = useState<string[]>([]);
  const fim = useRef<HTMLDivElement>(null);

  const total = exercicios.length;
  const concluidos = feitos.filter(Boolean).length;
  const pct = Math.round((concluidos / total) * 100);
  const ex = exercicios[sel] ?? exercicios[0]!;

  useEffect(() => {
    if (!tocando) return;
    const id = setInterval(() => setProg((p) => (p >= 100 ? 0 : p + 2)), 100);
    return () => clearInterval(id);
  }, [tocando]);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  const alternar = (i: number) => setFeitos((f) => f.map((v, idx) => (idx === i ? !v : v)));
  const abrirVideo = (i: number) => {
    setSel(i);
    setProg(0);
    setTocando(false);
    setTab("video");
  };
  const perguntar = (q: string) => {
    setUsadas((u) => [...u, q]);
    setMsgs((m) => [...m, { de: "aluno", texto: q }, { de: "luan", texto: respostas[q] ?? "Combinado!" }]);
  };
  const chips = Object.keys(respostas).filter((q) => !usadas.includes(q));

  return (
    <div className={`relative mx-auto w-[min(100%,290px)] ${className}`}>
      <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-lime/[.16] blur-3xl" />

      <div className="relative aspect-[9/17] overflow-hidden rounded-[44px] border border-white/15 bg-ink-deep p-2.5 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(168,255,31,.12)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#14181c_0%,#0c0e11_100%)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scan bg-gradient-to-b from-transparent via-lime/[.10] to-transparent" />
          <div className="mx-auto mt-2.5 h-5 w-24 flex-none rounded-full bg-black" />

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tab === "treino" && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.24em] text-lime">Treino de hoje</p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="font-serif text-[22px] font-bold leading-tight text-fg">Treino A</p>
                  <p className="font-mono text-[10px] text-fg-subtle">
                    {concluidos}/{total} feitos
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => abrirVideo(feitos.findIndex((v) => !v) === -1 ? 0 : feitos.findIndex((v) => !v))}
                  className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-3 text-left transition-colors hover:border-lime/40"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-lime text-onlime">
                    <IconPlay className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[12px] font-bold text-fg">Vídeo demonstrativo</span>
                    <span className="block text-[10px] text-fg-subtle">Toque para ver a execução</span>
                  </span>
                </button>

                <div className="mt-3 grid gap-2">
                  {exercicios.map((e, i) => (
                    <div
                      key={e.nome}
                      className={`flex items-center justify-between rounded-xl border pr-3 transition-colors ${
                        feitos[i] ? "border-lime/30 bg-lime/[.07]" : "border-white/[.08] bg-white/[.025]"
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={feitos[i]}
                        aria-label={`Marcar ${e.nome} como ${feitos[i] ? "pendente" : "feito"}`}
                        onClick={() => alternar(i)}
                        className="flex flex-1 items-center gap-2.5 py-2.5 pl-3 text-left"
                      >
                        <span
                          className={`grid h-5 w-5 flex-none place-items-center rounded-full transition-colors ${
                            feitos[i] ? "bg-lime text-onlime" : "border border-white/25 text-transparent"
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />
                        </span>
                        <span className="text-[12px] font-semibold text-fg">{e.nome}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirVideo(i)}
                        aria-label={`Ver vídeo de ${e.nome}`}
                        className="flex items-center gap-1.5 py-2.5 pl-2 font-mono text-[10px] text-fg-subtle transition-colors hover:text-lime"
                      >
                        {e.series}
                        <IconPlay className="h-3.5 w-3.5 text-lime" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[.2em] text-fg-subtle">
                    <span>{pct === 100 ? "Treino concluído!" : "Progresso"}</span>
                    <span className="text-lime">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-dark to-lime shadow-[0_0_12px_rgba(168,255,31,.7)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {tab === "video" && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.24em] text-lime">Execução</p>
                <p className="mt-1 font-serif text-[20px] font-bold leading-tight text-fg">{ex.nome}</p>

                <button
                  type="button"
                  onClick={() => setTocando((v) => !v)}
                  aria-label={tocando ? "Pausar vídeo" : "Reproduzir vídeo"}
                  className="relative mt-3 grid aspect-video w-full place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_40%,#232a22,#0e1013)]"
                >
                  <span className={`grid h-12 w-12 place-items-center rounded-full bg-lime text-onlime shadow-[0_0_30px_rgba(168,255,31,.5)] ${tocando ? "" : "animate-pulse"}`}>
                    {tocando ? (
                      <span className="flex gap-1">
                        <span className="h-4 w-1.5 rounded-sm bg-onlime" />
                        <span className="h-4 w-1.5 rounded-sm bg-onlime" />
                      </span>
                    ) : (
                      <IconPlay className="h-6 w-6" />
                    )}
                  </span>
                  <span className="absolute inset-x-3 bottom-2 h-1 overflow-hidden rounded-full bg-white/15">
                    <span className="block h-full rounded-full bg-lime" style={{ width: `${prog}%` }} />
                  </span>
                </button>

                <ul className="mt-3 grid gap-1.5">
                  {ex.dicas.map((d) => (
                    <li key={d} className="flex gap-2 text-[11px] leading-snug text-fg-muted">
                      <IconCheck className="mt-0.5 h-3 w-3 flex-none text-lime" />
                      {d}
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => abrirVideo((sel + 1) % total)}
                    className="flex-1 rounded-full border border-white/15 py-2 text-[11px] font-semibold text-fg-muted transition-colors hover:border-lime/50 hover:text-lime"
                  >
                    Próximo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alternar(sel);
                      setTab("treino");
                    }}
                    className="flex-1 rounded-full bg-lime py-2 text-[11px] font-bold text-onlime"
                  >
                    {feitos[sel] ? "Desmarcar" : "Marcar feito"}
                  </button>
                </div>
              </div>
            )}

            {tab === "evolucao" && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[.24em] text-lime">Sua evolução</p>
                <p className="mt-1 font-serif text-[20px] font-bold leading-tight text-fg">Carga no supino</p>
                <p className="mt-0.5 font-mono text-[10px] text-fg-subtle">Semana {semana + 1}: {semanas[semana]! + 22} kg</p>

                <div className="mt-4 flex h-32 items-end gap-2">
                  {semanas.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Semana ${i + 1}`}
                      onClick={() => setSemana(i)}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <span
                        className={`block w-full rounded-t-md transition-all duration-500 ${
                          i === semana ? "bg-lime shadow-[0_0_14px_rgba(168,255,31,.6)]" : "bg-white/15 group-hover:bg-lime/40"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex gap-2 font-mono text-[8px] text-fg-faint">
                  {semanas.map((_, i) => (
                    <span key={i} className="flex-1 text-center">S{i + 1}</span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-2.5">
                    <p className="font-serif text-[18px] font-bold text-lime">4/5</p>
                    <p className="text-[10px] text-fg-subtle">treinos na semana</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[.04] p-2.5">
                    <p className="font-serif text-[18px] font-bold text-lime">+{Math.round(((semanas[semana]! - semanas[0]!) / semanas[0]!) * 100)}%</p>
                    <p className="text-[10px] text-fg-subtle">desde a semana 1</p>
                  </div>
                </div>
              </div>
            )}

            {tab === "chat" && (
              <div className="flex min-h-full flex-col">
                <p className="font-mono text-[9px] uppercase tracking-[.24em] text-lime">Conversa com o Luan</p>
                <div className="mt-3 grid gap-2">
                  {msgs.map((m, i) => (
                    <p
                      key={i}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11.5px] leading-snug ${
                        m.de === "luan"
                          ? "rounded-bl-sm bg-white/[.07] text-fg"
                          : "ml-auto rounded-br-sm bg-lime text-onlime"
                      }`}
                    >
                      {m.texto}
                    </p>
                  ))}
                  <div ref={fim} />
                </div>
                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {chips.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => perguntar(q)}
                        className="rounded-full border border-lime/40 px-3 py-1.5 text-[10.5px] font-semibold text-lime transition-colors hover:bg-lime/10"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <nav aria-label="Menu do aplicativo" className="grid flex-none grid-cols-4 border-t border-white/10 bg-black/30 px-1 pb-2 pt-1.5">
            {abas.map(({ id, rotulo, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1 transition-colors ${tab === id ? "text-lime" : "text-fg-subtle hover:text-fg"}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="font-mono text-[8px] uppercase tracking-wider">{rotulo}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-fg-subtle">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
        Toque e experimente
      </p>

      <div className="absolute bottom-12 -left-8 hidden animate-floaty rounded-2xl border border-white/10 bg-ink/85 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl sm:block">
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-lime">App personalizado</p>
        <p className="text-[13px] font-semibold text-fg">Feito para o seu treino</p>
      </div>
      <div
        className="absolute -right-8 top-[9%] hidden animate-floaty rounded-2xl border border-white/10 bg-ink/85 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl sm:block"
        style={{ animationDelay: "-3.2s" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-lime">Online</p>
        <p className="text-[13px] font-semibold text-fg">De onde você estiver</p>
      </div>
    </div>
  );
}
