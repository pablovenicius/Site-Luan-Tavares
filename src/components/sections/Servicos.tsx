import { IconDumbbell, IconApp, IconCheck } from "@/components/icons";
import { whatsappLinks } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Spot } from "@/components/ui/Spot";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const servicos = [
  {
    Icon: IconApp,
    titulo: "Consultoria online",
    subtitulo: "Acompanhamento à distância, com o treino no nosso aplicativo personalizado.",
    itens: [
      "Aplicativo personalizado com o seu treino",
      "Vídeos demonstrativos dos exercícios",
      "Acompanhamento direto comigo",
      "Treine onde estiver, com segurança",
    ],
    cta: "Quero a consultoria",
    href: whatsappLinks.online,
    section: "servico-online",
    destaque: true,
  },
  {
    Icon: IconDumbbell,
    titulo: "Personal presencial",
    subtitulo: "Sessões individuais em Aracaju, acompanhadas do início ao fim.",
    itens: ["Treino individual e personalizado", "Correção da execução em tempo real", "Ajustes conforme a evolução"],
    cta: "Quero treinar presencial",
    href: whatsappLinks.presencial,
    section: "servico-presencial",
    destaque: false,
  },
];

export function Servicos() {
  return (
    <section id="servicos" className="mx-auto max-w-[1240px] px-5 py-[clamp(52px,8vw,116px)]">
      <Reveal className="mb-9 max-w-[720px] sm:mb-12">
        <SectionLabel index="03">Serviços</SectionLabel>
        <h2 className="mb-5 font-serif text-[clamp(30px,4.2vw,54px)] font-bold leading-[1.06] text-fg">
          Duas formas de <span className="italic text-lime">treinar comigo.</span>
        </h2>
        <p className="text-lg text-fg-muted">
          A consultoria online é o caminho mais completo para evoluir de qualquer lugar, com um
          aplicativo personalizado para o seu treino. Se preferir treinar ao vivo, também atendo
          presencial. Os planos são apresentados na conversa.
        </p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        {servicos.map(({ Icon, titulo, subtitulo, itens, cta, href, section, destaque }, i) => (
          <Reveal key={titulo} delay={i * 120} className="h-full">
            <Spot
              as="article"
              className={`group flex h-full flex-col rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1.5 sm:p-8 ${
                destaque
                  ? "beam border-lime/30 bg-[linear-gradient(160deg,#1b2612_0%,#0e1013_58%)] shadow-[0_30px_80px_-35px_rgba(168,255,31,.4)]"
                  : "border-white/[.09] bg-ink-alt hover:border-lime/40 hover:shadow-[0_30px_70px_-30px_rgba(168,255,31,.2)]"
              }`}
            >
              <div className="mb-6 flex items-start justify-between sm:mb-8">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-lime/25 bg-lime/10 text-lime transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="font-mono text-4xl font-bold text-white/[.07] transition-colors duration-500 group-hover:text-lime/25">
                  0{i + 1}
                </span>
              </div>

              {destaque && (
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-lime px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-onlime">
                  Foco principal
                </span>
              )}
              <h3 className="mb-2 font-serif text-[28px] font-bold leading-tight text-fg">{titulo}</h3>
              <p className="mb-6 max-w-[46ch] text-[15px] text-fg-subtle">{subtitulo}</p>

              <ul className={`mb-8 grid gap-3 ${destaque ? "sm:grid-cols-2" : ""}`}>
                {itens.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] text-fg-muted">
                    <IconCheck className="mt-1 h-4 w-4 flex-none text-lime" />
                    {item}
                  </li>
                ))}
              </ul>

              <WhatsAppButton
                href={href}
                section={section}
                variant={destaque ? "solid" : "outline"}
                icon={false}
                arrow
                className="mt-auto w-full"
              >
                {cta}
              </WhatsAppButton>
            </Spot>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
