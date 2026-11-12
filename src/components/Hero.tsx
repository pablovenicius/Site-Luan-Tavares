import { siteConfig } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconCheck } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Photo } from "@/components/ui/Photo";
import { Spot } from "@/components/ui/Spot";

const beneficios = ["Treino 100% personalizado", "Acompanhamento próximo", "Também presencial em Aracaju"];

/** Palavras que entram uma a uma, com máscara (efeito de "subida"). */
function Words({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[.12em] align-bottom">
          <span
            className={`inline-block animate-word-up ${className ?? ""}`}
            style={{ animationDelay: `${start + i * 70}ms` }}
          >
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
      className="grain relative isolate overflow-hidden bg-[radial-gradient(900px_560px_at_85%_10%,rgba(168,255,31,.10),transparent_60%),radial-gradient(700px_500px_at_0%_100%,rgba(95,227,27,.06),transparent_60%)]"
    >
      <div id="topo" className="absolute top-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_70%_30%,#000,transparent_70%)]"
      />

      <div className="mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-14 px-5 pb-20 pt-32 lg:grid-cols-[1.15fr_.85fr] lg:gap-10 lg:pt-28">
        <div>
          <p
            className="mb-7 inline-flex animate-fade-up items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-lime"
            style={{ animationDelay: "100ms" }}
          >
            <span className="h-px w-10 bg-lime" />
            Consultoria online · Personal Trainer
          </p>

          <h1 className="mb-7 font-serif text-[clamp(42px,7.2vw,94px)] font-bold leading-[1.02] tracking-[-.01em] text-fg">
            <Words text="Seu treino online," start={200} />
            <br />
            <Words
              text="feito para você."
              start={560}
              className="bg-gradient-to-r from-lime via-lime-soft to-lime-dark bg-clip-text italic text-transparent"
            />
          </h1>

          <p
            className="mb-10 max-w-[48ch] animate-fade-up text-[clamp(17px,1.5vw,20px)] leading-relaxed text-fg-muted"
            style={{ animationDelay: "900ms" }}
          >
            Consultoria online com treino personalizado no aplicativo e acompanhamento de perto, de
            onde você estiver. Prefere treinar ao vivo? Também atendo presencial em {siteConfig.city}.
          </p>

          <div
            className="mb-10 flex animate-fade-up flex-wrap gap-4"
            style={{ animationDelay: "1050ms" }}
          >
            <WhatsAppButton href={whatsappLinks.online} section="hero" size="lg" arrow>
              Quero a consultoria online
            </WhatsAppButton>
            <WhatsAppButton
              href={whatsappLinks.presencial}
              section="hero-presencial"
              variant="outline"
              size="lg"
              icon={false}
            >
              Treino presencial
            </WhatsAppButton>
          </div>

          <ul
            className="flex animate-fade-up flex-wrap gap-x-7 gap-y-3"
            style={{ animationDelay: "1200ms" }}
          >
            {beneficios.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm font-semibold text-fg-muted">
                <IconCheck className="h-4 w-4 text-lime" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[460px] animate-fade-up lg:max-w-none" style={{ animationDelay: "500ms" }}>
          <div
            aria-hidden="true"
            className="absolute -inset-5 -z-10 rotate-3 rounded-[28px] border border-lime/20"
          />
          <Photo
            src={siteConfig.photos.hero}
            alt="Luan Tavares, personal trainer"
            ratio="4/5"
            priority
            speed={0.1}
          />
          <div className="absolute -left-4 top-[14%] hidden animate-floaty rounded-2xl border border-white/10 bg-ink/80 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime">Consultoria online</p>
            <p className="text-sm font-semibold text-fg">Todo o Brasil</p>
          </div>
          <div
            className="absolute -right-3 bottom-[12%] hidden animate-floaty rounded-2xl border border-white/10 bg-ink/80 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block"
            style={{ animationDelay: "-3s" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime">Presencial</p>
            <p className="text-sm font-semibold text-fg">{siteConfig.city} e região</p>
          </div>
        </div>
      </div>
    </Spot>
  );
}
