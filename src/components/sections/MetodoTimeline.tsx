"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Etapa = { numero: string; titulo: string; texto: string };

/** Linha do tempo cuja linha lima "desenha" conforme a rolagem. */
export function MetodoTimeline({ etapas }: { etapas: readonly Etapa[] }) {
  const wrap = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const alvo = window.innerHeight * 0.55;
      const p = Math.min(Math.max((alvo - r.top) / r.height, 0), 1);
      if (line.current) line.current.style.transform = `scaleY(${reduz ? 1 : p})`;
      setAtivo(reduz ? etapas.length - 1 : Math.min(Math.floor(p * etapas.length * 0.999), etapas.length - 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [etapas.length]);

  return (
    <ol ref={wrap} className="relative grid gap-12 pl-14 sm:pl-20">
      <div aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-white/10 sm:left-[27px]">
        <div
          ref={line}
          className="h-full origin-top scale-y-0 bg-gradient-to-b from-lime via-lime to-lime-dark shadow-[0_0_14px_rgba(168,255,31,.7)]"
        />
      </div>

      {etapas.map((e, i) => (
        <li key={e.numero} className="relative">
          <span
            className={cn(
              "absolute -left-14 top-0 grid h-10 w-10 place-items-center rounded-full border text-xs font-bold transition-all duration-500 sm:-left-20 sm:h-14 sm:w-14 sm:text-sm",
              i <= ativo
                ? "scale-100 border-lime bg-lime text-onlime shadow-[0_0_28px_rgba(168,255,31,.45)]"
                : "scale-90 border-white/15 bg-ink text-fg-subtle"
            )}
          >
            {e.numero}
          </span>
          <div className={cn("transition-all duration-500", i <= ativo ? "opacity-100" : "opacity-40")}>
            <h3 className="mb-2 font-serif text-[clamp(24px,2.6vw,34px)] font-bold text-fg">{e.titulo}</h3>
            <p className="max-w-[48ch] text-[17px] leading-relaxed text-fg-muted">{e.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
