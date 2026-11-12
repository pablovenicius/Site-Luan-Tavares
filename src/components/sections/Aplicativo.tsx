import { whatsappLinks } from "@/lib/whatsapp";
import { IconChat, IconGlobe, IconPlay, IconSliders } from "@/components/icons";
import { AppMockup } from "@/components/ui/AppMockup";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Spot } from "@/components/ui/Spot";
import { Tilt } from "@/components/ui/Tilt";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const recursos = [
  {
    Icon: IconSliders,
    titulo: "Treino sob medida",
    texto: "Montado a partir da sua rotina, do seu nível e do seu objetivo.",
  },
  {
    Icon: IconPlay,
    titulo: "Vídeos dos exercícios",
    texto: "Veja a execução correta antes de começar cada movimento.",
  },
  {
    Icon: IconChat,
    titulo: "Acompanhamento direto",
    texto: "Os ajustes passam por mim, conforme a sua evolução.",
  },
  {
    Icon: IconGlobe,
    titulo: "Treine onde estiver",
    texto: "Na academia, em casa ou viajando, tudo no seu celular.",
  },
] as const;

export function Aplicativo() {
  return (
    <section id="app" className="relative isolate overflow-hidden border-y border-white/[.06] bg-ink-alt">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_30%_50%,#000,transparent_70%)]"
      />
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-[clamp(52px,8vw,116px)] lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <Reveal variant="scale" className="order-2 lg:order-1">
          <Tilt className="mx-auto max-w-[250px] sm:max-w-none">
            <AppMockup />
          </Tilt>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <SectionLabel index="02">Aplicativo</SectionLabel>
            <h2 className="mb-5 font-serif text-[clamp(30px,4.2vw,54px)] font-bold leading-[1.06] text-fg">
              Seu treino no bolso, <span className="italic text-lime">feito sob medida.</span>
            </h2>
            <p className="mb-9 max-w-[54ch] text-lg leading-relaxed text-fg-muted">
              Na consultoria online você treina pelo nosso <strong className="font-bold text-fg">aplicativo personalizado</strong>:
              tudo organizado, com vídeos demonstrativos e o meu acompanhamento do início ao fim.
            </p>
          </Reveal>

          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
            {recursos.map(({ Icon, titulo, texto }, i) => (
              <Reveal key={titulo} delay={i * 90} className="h-full">
                <Spot
                  as="div"
                  className="group h-full rounded-2xl border border-white/[.09] bg-ink/70 p-4 transition-all sm:p-5 duration-500 hover:-translate-y-1 hover:border-lime/40"
                >
                  <span className="mb-3 grid h-10 w-10 sm:mb-4 sm:h-11 sm:w-11 place-items-center rounded-xl border border-lime/25 bg-lime/10 text-lime transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-1 text-[15px] font-bold leading-snug text-fg sm:text-[16px]">{titulo}</h3>
                  <p className="text-[13.5px] leading-relaxed text-fg-subtle sm:text-[14.5px]">{texto}</p>
                </Spot>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <WhatsAppButton href={whatsappLinks.online} section="aplicativo" arrow className="w-full sm:w-auto">
              Quero a consultoria online
            </WhatsAppButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
