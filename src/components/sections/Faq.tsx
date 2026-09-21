import { faqItems } from "@/lib/structured-data";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  return (
    <Reveal>
      <section id="faq" className="border-y border-fg/[.06] bg-ink-alt">
        <div className="mx-auto max-w-[880px] px-5 py-[clamp(64px,8vw,116px)]">
          <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">
            Dúvidas frequentes
          </p>
          <h2 className="mb-10 font-serif text-[clamp(28px,4vw,46px)] font-bold leading-[1.12] text-fg">
            Perguntas antes de começar
          </h2>

          <div className="grid gap-3">
            {faqItems.map(({ pergunta, resposta }) => (
              <details
                key={pergunta}
                className="rounded-xl border border-fg/[.09] bg-ink px-[22px] py-1"
              >
                <summary className="flex min-h-[44px] items-center justify-between gap-4 py-5 text-[17px] font-bold text-fg [&::-webkit-details-marker]:hidden">
                  {pergunta}
                  <span aria-hidden="true" className="text-[22px] leading-none text-lime">
                    +
                  </span>
                </summary>
                <p className="mb-5 text-base text-fg-muted">{resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
