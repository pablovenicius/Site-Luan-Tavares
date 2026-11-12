"use client";

import { useState } from "react";
import { faqItems } from "@/lib/structured-data";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section id="faq" className="border-y border-white/[.06] bg-ink-alt">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-[clamp(80px,10vw,150px)] lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-lime">
            <span className="h-px w-10 bg-lime" />
            Dúvidas
          </p>
          <h2 className="font-serif text-[clamp(32px,4.6vw,60px)] font-bold leading-[1.06] text-fg">
            Antes de <span className="italic text-lime">começar.</span>
          </h2>
        </Reveal>

        <div className="grid gap-3">
          {faqItems.map((item, i) => {
            const on = aberto === i;
            return (
              <Reveal key={item.pergunta} delay={i * 70}>
                <div
                  className={cn(
                    "rounded-2xl border transition-colors duration-500",
                    on ? "border-lime/40 bg-ink" : "border-white/[.09] bg-ink/60 hover:border-white/20"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={`faq-${i}`}
                      onClick={() => setAberto(on ? null : i)}
                      className="flex min-h-[64px] w-full items-center justify-between gap-6 px-6 py-5 text-left text-[18px] font-bold text-fg"
                    >
                      {item.pergunta}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid h-8 w-8 flex-none place-items-center rounded-full border text-lg leading-none transition-all duration-500",
                          on ? "rotate-45 border-lime bg-lime text-onlime" : "border-white/20 text-lime"
                        )}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-${i}`}
                    role="region"
                    className={cn(
                      "grid transition-all duration-500 ease-out",
                      on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-base leading-relaxed text-fg-muted">{item.resposta}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
