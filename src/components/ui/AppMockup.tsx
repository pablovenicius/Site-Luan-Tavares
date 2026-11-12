import { IconCheck, IconPlay } from "@/components/icons";

const exercicios = [
  { nome: "Supino reto", series: "4 × 10", feito: true },
  { nome: "Crucifixo inclinado", series: "3 × 12", feito: true },
  { nome: "Tríceps na polia", series: "3 × 12", feito: false },
  { nome: "Flexão de braço", series: "3 × 15", feito: false },
];

/** Ilustração do aplicativo de treino em uma moldura de celular (somente CSS). */
export function AppMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-[min(100%,290px)] ${className}`} role="img" aria-label="Ilustração do aplicativo de treino personalizado">
      <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-lime/[.16] blur-3xl" />

      <div className="relative aspect-[9/16] overflow-hidden rounded-[44px] border border-white/15 bg-ink-deep p-2.5 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(168,255,31,.12)]">
        <div className="relative h-full overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#14181c_0%,#0c0e11_100%)]">
          {/* linha de varredura */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scan bg-gradient-to-b from-transparent via-lime/[.12] to-transparent" />

          <div className="mx-auto mt-2.5 h-5 w-24 rounded-full bg-black" />

          <div className="px-4 pb-4 pt-4">
            <p className="font-mono text-[9px] uppercase tracking-[.24em] text-lime">Treino de hoje</p>
            <p className="mt-1 font-serif text-[22px] font-bold leading-tight text-fg">Treino A</p>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.04] p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-onlime">
                  <IconPlay className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[12px] font-bold text-fg">Vídeo demonstrativo</p>
                  <p className="text-[10px] text-fg-subtle">Execução passo a passo</p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {exercicios.map((e) => (
                <div
                  key={e.nome}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                    e.feito ? "border-lime/30 bg-lime/[.07]" : "border-white/[.08] bg-white/[.025]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full ${
                        e.feito ? "bg-lime text-onlime" : "border border-white/20 text-transparent"
                      }`}
                    >
                      <IconCheck className="h-3 w-3" />
                    </span>
                    <span className="text-[12px] font-semibold text-fg">{e.nome}</span>
                  </div>
                  <span className="font-mono text-[10px] text-fg-subtle">{e.series}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[.2em] text-fg-subtle">
                <span>Progresso</span>
                <span className="text-lime">50%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-lime-dark to-lime shadow-[0_0_12px_rgba(168,255,31,.7)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-8 hidden animate-floaty rounded-2xl border border-white/10 bg-ink/85 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl sm:block">
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
