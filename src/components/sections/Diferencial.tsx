import { whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";

export function Diferencial() {
  return (
    <Reveal>
      <section className="relative overflow-hidden border-y border-fg/[.06] bg-[linear-gradient(135deg,#1E2229_0%,#14171C_55%,#1A2418_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[120px] -left-[90px] h-[420px] w-[420px] rotate-[22deg] border-b border-r border-lime/[.22] [border-bottom-color:rgba(168,255,31,.12)]"
        />
        <div className="relative mx-auto max-w-[900px] px-5 py-[clamp(64px,8vw,110px)] text-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-lime">Diferencial</p>
          <h2 className="mb-6 text-balance font-serif text-[clamp(28px,4.4vw,52px)] font-bold leading-[1.1] text-fg">
            Mais do que passar exercícios, acompanho o seu processo.
          </h2>
          <p className="mx-auto mb-[34px] max-w-[58ch] text-pretty text-[clamp(16px,1.5vw,18px)] text-fg-muted">
            Planejamento, acompanhamento e consistência caminham juntos. O treino é adaptado à
            realidade de cada pessoa — porque é isso que faz você continuar treinando e evoluindo.
          </p>
          <WhatsAppButton href={whatsappLinks.geral} section="diferencial" variant="outline">
            Conversar com o Luan
          </WhatsAppButton>
        </div>
      </section>
    </Reveal>
  );
}
