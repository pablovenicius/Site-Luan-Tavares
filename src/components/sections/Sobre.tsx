import { siteConfig } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconCheck } from "@/components/icons";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const pontos = [
  "Treino personalizado no aplicativo, montado a partir da sua rotina",
  "Acompanhamento à distância, com ajustes a cada fase",
  "Também atendo presencial em Aracaju, se você preferir",
];

export function Sobre() {
  return (
    <section id="sobre" className="mx-auto max-w-[1240px] px-5 py-[clamp(80px,10vw,150px)]">
      <div className="grid items-center gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
        <Reveal variant="left" className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
          <Photo
            src={siteConfig.photos.sobre}
            alt="Luan Tavares orientando um aluno"
            ratio="4/5"
            speed={0.14}
          >
            <div className="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-ink/80 px-4 py-2.5 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[.22em] text-lime">CREF</p>
              <p className="text-sm font-semibold text-fg">{siteConfig.cref}</p>
            </div>
          </Photo>
        </Reveal>

        <div>
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-lime">
              <span className="h-px w-10 bg-lime" />
              Sobre
            </p>
            <h2 className="mb-6 font-serif text-[clamp(32px,4.6vw,60px)] font-bold leading-[1.06] text-fg">
              Mais do que passar exercícios,{" "}
              <span className="italic text-lime">acompanho o seu processo.</span>
            </h2>
            <p className="mb-9 max-w-[54ch] text-lg leading-relaxed text-fg-muted">
              Sou o Luan, personal trainer em {siteConfig.city} e, hoje, também o seu treinador online. Planejamento, acompanhamento e
              consistência caminham juntos: o treino é adaptado à realidade de cada pessoa, porque é
              isso que faz você continuar treinando e evoluindo.
            </p>
          </Reveal>

          <ul className="mb-10 grid gap-4">
            {pontos.map((p, i) => (
              <Reveal as="li" key={p} delay={i * 110} className="flex items-start gap-4">
                <span className="mt-1 grid h-6 w-6 flex-none place-items-center rounded-full bg-lime/15 text-lime">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span className="text-[17px] text-fg">{p}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={200}>
            <WhatsAppButton href={whatsappLinks.online} section="sobre" arrow>
              Quero a consultoria online
            </WhatsAppButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
