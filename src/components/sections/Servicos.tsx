import { IconDumbbell, IconApp, IconBarChart, IconCheck } from "@/components/icons";
import { whatsappLinks } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/Reveal";
import { Spot } from "@/components/ui/Spot";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const servicos = [
  {
    Icon: IconApp,
    titulo: "Consultoria online",
    subtitulo: "Acompanhamento à distância, com treino no aplicativo.",
    itens: ["Treino personalizado no aplicativo", "Vídeos demonstrativos dos exercícios", "Acompanhamento direto comigo", "Treine onde estiver, com segurança"],
    cta: "Quero a consultoria",
    href: whatsappLinks.online,
    section: "servico-online",
    destaque: true,
  },
  {
    Icon: IconDumbbell,
    titulo: "Personal presencial",
    subtitulo: "Sessões individuais, acompanhadas do início ao fim.",
    itens: ["Treino individual e personalizado", "Correção da execução em tempo real", "Ajustes conforme a evolução"],
    cta: "Quero treinar presencial",
    href: whatsappLinks.presencial,
    section: "servico-presencial",
    destaque: false,
  },
  {
    Icon: IconBarChart,
    titulo: "Avaliação física",
    subtitulo: "O ponto de partida para planejar e medir a evolução.",
    itens: ["Leitura do seu estado atual", "Base para o planejamento do treino", "Atenção a limitações e histórico"],
    cta: "Agendar avaliação",
    href: whatsappLinks.avaliacao,
    section: "servico-avaliacao",
    destaque: false,
  },
];

export function Servicos() {
  return (
    <section id="servicos" className="border-y border-white/[.06] bg-ink-alt">
      <div className="mx-auto max-w-[1240px] px-5 py-[clamp(80px,10vw,150px)]">
        <Reveal className="mb-16 max-w-[720px]">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-lime">
            <span className="h-px w-10 bg-lime" />
            Serviços
          </p>
          <h2 className="mb-5 font-serif text-[clamp(32px,4.6vw,60px)] font-bold leading-[1.06] text-fg">
            Três formas de <span className="italic text-lime">treinar comigo.</span>
          </h2>
          <p className="text-lg text-fg-muted">
            A consultoria online é o caminho mais completo para evoluir de qualquer lugar. Se preferir
            treinar ao vivo, também atendo presencial. Os planos são apresentados na conversa.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {servicos.map(({ Icon, titulo, subtitulo, itens, cta, href, section, destaque }, i) => (
            <Reveal key={titulo} delay={i * 120} className="h-full">
              <Spot
                as="article"
                className={`group flex h-full flex-col rounded-3xl border p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(168,255,31,.25)] ${
                  destaque
                    ? "border-lime/50 bg-[linear-gradient(160deg,#1a2412_0%,#0e1013_55%)] shadow-[0_30px_80px_-35px_rgba(168,255,31,.35)]"
                    : "border-white/[.09] bg-ink hover:border-lime/40"
                }`}
              >
                <div className="mb-10 flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-lime/25 bg-lime/10 text-lime transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="font-serif text-5xl font-bold text-white/[.07] transition-colors duration-500 group-hover:text-lime/25">
                    0{i + 1}
                  </span>
                </div>
                {destaque && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-onlime">
                    Foco principal
                  </span>
                )}
                <h3 className="mb-2 font-serif text-[28px] font-bold leading-tight text-fg">{titulo}</h3>
                <p className="mb-7 text-[15px] text-fg-subtle">{subtitulo}</p>
                <ul className="mb-9 grid gap-3">
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
      </div>
    </section>
  );
}
