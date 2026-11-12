const itens = [
  "Hipertrofia",
  "Emagrecimento",
  "Condicionamento",
  "Força",
  "Treino funcional",
  "Iniciantes",
  "Performance",
];

export function Marquee() {
  const linha = itens.map((t) => (
    <span key={t} className="flex items-center gap-10 whitespace-nowrap">
      <span className="font-serif text-[clamp(26px,3.6vw,44px)] font-bold italic text-fg/90">{t}</span>
      <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-lime" />
    </span>
  ));

  return (
    <div
      aria-label="Objetivos atendidos"
      className="overflow-hidden border-y border-white/[.07] bg-ink-alt py-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
    >
      <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
        <div className="flex gap-10">{linha}</div>
        <div aria-hidden="true" className="flex gap-10">
          {linha}
        </div>
      </div>
    </div>
  );
}
