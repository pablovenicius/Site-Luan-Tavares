"use client";

import { useState } from "react";
import { faqItems } from "@/lib/structured-data";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";

export function Faq() {
  const [aberto, setAberto] = useState<number | null>(0);

  return (
    <section id="faq" className="border-y border-white/[.06] bg-ink-alt">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 py-[clamp(52px,8vw,116px)] lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <SectionLabel index="05">Dúvidas</SectionLabel>
          <h2 className="font-serif text-[clamp(30px,4.2vw,54px)] font-bold leading-[1.06] text-fg">
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
                          "flex flex-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold leading-none transition-all duration-500",
                          on ? "border-lime bg-lime text-onlime" : "border-white/20 text-lime"
                        )}
                      >
                        Saiba mais
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cn("h-3 w-3 transition-transform duration-500", on && "rotate-180")}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
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
