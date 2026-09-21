import Image from "next/image";
import { siteConfig } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconCheck } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

const checklist = [
  "Atendimento presencial e online",
  "Treino 100% personalizado",
  "Acompanhamento próximo",
];

export function Hero() {
  return (
    <section
      id="topo"
      className="relative overflow-hidden border-b border-fg/[.06] bg-[radial-gradient(1100px_620px_at_78%_8%,rgba(95,227,27,.10),transparent_62%),linear-gradient(180deg,#14171C_0%,#191D23_60%,#14171C_100%)]"
    >
      {/* textura de pontos decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[.55] [background-image:radial-gradient(rgba(242,244,245,.045)_1px,transparent_1px)] [background-size:4px_4px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[60px] -top-20 h-[520px] w-[520px] rotate-[18deg] border-l border-t border-lime/[.22] [border-top-color:rgba(168,255,31,.10)]"
      />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-center gap-[clamp(36px,5vw,64px)] px-5 pb-[clamp(56px,7vw,104px)] pt-[clamp(48px,7vw,96px)]">
        <div>
          <Image
            src={siteConfig.logo}
            alt={siteConfig.brand}
            width={1400}
            height={768}
            priority
            className="mb-7 block h-auto w-[min(340px,72%)]"
          />
          <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">
            Presencial em {siteConfig.city} · Consultoria online
          </p>
          <h1 className="mb-5 text-balance font-serif text-[clamp(34px,5.1vw,60px)] font-bold leading-[1.08] text-fg">
            Treino personalizado para o{" "}
            <span className="bg-gradient-to-r from-lime to-lime-dark bg-clip-text text-transparent">
              seu objetivo
            </span>
            , do seu jeito e com acompanhamento de perto.
          </h1>
          <p className="mb-8 max-w-[46ch] text-pretty text-[clamp(16px,1.6vw,19px)] text-fg-muted">
            Planejamento feito a partir da sua rotina, do seu condicionamento e das suas
            necessidades. Presencial em {siteConfig.city} ou consultoria online, com
            acompanhamento próximo em cada etapa.
          </p>
          <div className="mb-[34px] flex flex-wrap gap-3.5">
            <WhatsAppButton href={whatsappLinks.geral} section="hero" size="lg">
              Quero começar agora
            </WhatsAppButton>
            <a
              href="#servicos"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl border border-fg/30 px-7 text-base font-bold text-fg transition-all hover:border-lime hover:bg-lime/[.07]"
            >
              Conhecer serviços
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-[22px] gap-y-2.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-fg-muted">
                <IconCheck className="h-[17px] w-[17px] flex-none text-lime" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3.5 -rotate-2 rounded-[20px] border border-lime/[.28]"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,.5)]">
            <ImagePlaceholder label="Foto do Luan treinando — vertical 4:5, luz lateral, fundo escuro" />
          </div>
          <p className="mt-3 px-0.5 text-xs tracking-wide text-fg-subtle">
            Substitua o placeholder por uma foto profissional do Luan (proporção 4:5, fundo escuro).
          </p>
        </div>
      </div>
    </section>
  );
}
