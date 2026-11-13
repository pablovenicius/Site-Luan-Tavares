import { siteConfig } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Spot } from "@/components/ui/Spot";
import { HeroVideo } from "@/components/ui/HeroVideo";

/** Palavras que entram uma a uma, com máscara (efeito de "subida"). */
function Words({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[.12em] align-bottom">
          <span className={`inline-block animate-word-up ${className ?? ""}`} style={{ animationDelay: `${start + i * 70}ms` }}>
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}

export function Hero() {
  return (
    <Spot
      as="section"
      className="grain relative isolate overflow-hidden bg-[radial-gradient(900px_560px_at_85%_10%,rgba(168,255,31,.12),transparent_60%),radial-gradient(700px_500px_at_0%_100%,rgba(95,227,27,.07),transparent_60%)]"
    >
      <div id="topo" className="absolute top-0" />
      {/* Fundo em vídeo + camadas escuras para o texto continuar legível */}
      <HeroVideo />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(14,16,19,.82),rgba(14,16,19,.46)_45%,rgba(14,16,19,.06)_85%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-32 bg-gradient-to-t from-ink to-transparent"
      />
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_30%,#000,transparent_72%)]"
      />

      <div className="mx-auto grid lg:min-h-[88svh] max-w-[1240px] items-center gap-8 px-5 pb-14 pt-[92px] sm:gap-12 sm:pt-[104px] lg:gap-10 lg:pt-24">
        <div className="max-w-[860px]">
          <p
            className="mb-6 inline-flex animate-fade-up items-center gap-3 rounded-full border border-lime/25 bg-lime/[.07] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[.22em] text-lime"
            style={{ animationDelay: "100ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            Consultoria online · Todo o Brasil
          </p>

          <h1 className="mb-6 font-serif text-[clamp(42px,7vw,96px)] font-bold leading-[1.02] tracking-[-.01em] text-fg">
            <Words text="Seu treino online," start={200} />
            <br />
            <Words text="feito para você." start={560} className="text-shine italic" />
          </h1>

          <p
            className="mb-8 max-w-[42ch] animate-fade-up text-[clamp(17px,1.5vw,19px)] leading-relaxed text-fg-muted"
            style={{ animationDelay: "900ms" }}
          >
            Aplicativo personalizado e acompanhamento de perto. Também presencial em {siteConfig.city}.
          </p>

          <div className="flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5" style={{ animationDelay: "1050ms" }}>
            <WhatsAppButton href={whatsappLinks.online} section="hero" size="lg" arrow className="w-full sm:w-auto">
              Quero a consultoria online
            </WhatsAppButton>
            <WhatsAppButton
              href={whatsappLinks.presencial}
              section="hero-presencial"
              variant="outline"
              size="lg"
              icon={false}
              className="w-full sm:w-auto"
            >
              Treino presencial
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </Spot>
  );
}
