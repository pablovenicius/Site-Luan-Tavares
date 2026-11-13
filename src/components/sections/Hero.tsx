import { siteConfig } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconCheck, IconInstagram } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { AppMockup } from "@/components/ui/AppMockup";
import { Photo } from "@/components/ui/Photo";
import { Spot } from "@/components/ui/Spot";
import { Tilt } from "@/components/ui/Tilt";

const beneficios = ["Aplicativo personalizado", "Acompanhamento próximo", "Também presencial em Aracaju"];

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
  const temFoto = Boolean(siteConfig.photos.hero);

  return (
    <Spot
      as="section"
      className="grain relative isolate overflow-hidden bg-[radial-gradient(900px_560px_at_85%_10%,rgba(168,255,31,.12),transparent_60%),radial-gradient(700px_500px_at_0%_100%,rgba(95,227,27,.07),transparent_60%)]"
    >
      <div id="topo" className="absolute top-0" />
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_70%_30%,#000,transparent_72%)]"
      />

      <div className="mx-auto grid lg:min-h-[92svh] max-w-[1240px] items-center gap-8 px-5 pb-12 pt-[92px] sm:gap-12 sm:pt-[104px] lg:grid-cols-[1.1fr_.9fr] lg:gap-10 lg:pt-24">
        <div>
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

          <h1 className="mb-6 font-serif text-[clamp(40px,5.8vw,78px)] font-bold leading-[1.02] tracking-[-.01em] text-fg">
            <Words text="Seu treino online," start={200} />
            <br />
            <Words text="feito para você." start={560} className="text-shine italic" />
          </h1>

          <p
            className="mb-8 max-w-[50ch] animate-fade-up text-[clamp(17px,1.5vw,19px)] leading-relaxed text-fg-muted"
            style={{ animationDelay: "900ms" }}
          >
            Treino no nosso <strong className="font-semibold text-fg">aplicativo personalizado</strong> e
            acompanhamento de perto, de onde você estiver. Prefere treinar ao vivo? Também atendo
            presencial em {siteConfig.city}.
          </p>

          <div className="mb-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5" style={{ animationDelay: "1050ms" }}>
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

          <div
            className="flex animate-fade-up flex-wrap items-center gap-x-7 gap-y-4"
            style={{ animationDelay: "1200ms" }}
          >
            <ul className="hidden flex-wrap gap-x-6 gap-y-2.5 sm:flex">
              {beneficios.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm font-semibold text-fg-muted">
                  <IconCheck className="h-4 w-4 text-lime" />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-fg-muted transition-colors hover:border-lime/50 hover:text-lime"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime/10 text-lime transition-transform duration-300 group-hover:scale-110">
                <IconInstagram className="h-4 w-4" />
              </span>
              @{siteConfig.instagram}
            </a>
          </div>
        </div>

        <div
          className="relative mx-auto w-full max-w-[460px] animate-fade-up pb-2 lg:max-w-none"
          style={{ animationDelay: "500ms" }}
        >
          {temFoto && (
            <div className="absolute left-0 top-6 hidden w-[56%] sm:block lg:left-[-4%]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 -rotate-3 rounded-[28px] border border-lime/20"
              />
              <Photo
                src={siteConfig.photos.hero}
                alt="Luan Tavares, personal trainer"
                ratio="4/5"
                priority
                speed={0.1}
              />
            </div>
          )}
          <div className={temFoto ? "sm:ml-auto sm:w-[62%] lg:w-[58%]" : ""}>
            <Tilt>
              <AppMockup />
            </Tilt>
          </div>
        </div>
      </div>
    </Spot>
  );
}
