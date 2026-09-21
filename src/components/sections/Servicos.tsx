import { IconDumbbell, IconApp, IconBarChart, IconCheck } from "@/components/icons";
import { whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";

const servicos = [
  {
    Icon: IconDumbbell,
    titulo: "Personal Trainer Presencial",
    subtitulo: "Treinos individuais, acompanhados do início ao fim da sessão.",
    itens: [
      "Treino individual e personalizado",
      "Acompanhamento durante as sessões",
      "Correção da execução dos exercícios",
      "Ajustes conforme a evolução",
    ],
    cta: "Quero treinar presencial",
    href: whatsappLinks.presencial,
    section: "servico-presencial",
  },
  {
    Icon: IconApp,
    titulo: "Consultoria Online",
    subtitulo: "Acompanhamento à distância, com treino no aplicativo.",
    itens: [
      "Treino personalizado via aplicativo",
      "Vídeos demonstrativos dos exercícios",
      "Orientações para treinar com segurança",
      "Autonomia para treinar onde estiver",
    ],
    cta: "Quero a consultoria online",
    href: whatsappLinks.online,
    section: "servico-online",
  },
  {
    Icon: IconBarChart,
    titulo: "Avaliação Física",
    subtitulo: "O ponto de partida para planejar e medir a evolução.",
    itens: [
      "Leitura do seu estado atual",
      "Base para o planejamento do treino",
      "Acompanhamento da evolução",
      "Atenção a limitações e histórico",
    ],
    cta: "Agendar avaliação",
    href: whatsappLinks.avaliacao,
    section: "servico-avaliacao",
  },
];

export function Servicos() {
  return (
    <Reveal>
      <section
        id="servicos"
        className="border-y border-fg/[.06] bg-ink-alt"
      >
        <div className="mx-auto max-w-[1200px] px-5 py-[clamp(64px,8vw,116px)]">
          <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">
            Serviços
          </p>
          <h2 className="mb-4 font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.12] text-fg">
            Três formas de treinar comigo
          </h2>
          <p className="mb-[46px] max-w-[54ch] text-fg-muted">
            Escolha a modalidade que combina com a sua rotina. Os planos de acompanhamento são
            apresentados na conversa.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[22px]">
            {servicos.map(({ Icon, titulo, subtitulo, itens, cta, href, section }) => (
              <article
                key={titulo}
                className="flex flex-col rounded-[18px] border border-fg/[.09] bg-ink p-8 transition-all duration-300 hover:-translate-y-1 hover:border-lime/45"
              >
                <div className="mb-[22px] grid h-[52px] w-[52px] place-items-center rounded-xl border border-lime/25 bg-lime/10">
                  <Icon className="h-[26px] w-[26px] text-lime" />
                </div>
                <h3 className="mb-2.5 text-[22px] font-extrabold text-fg">{titulo}</h3>
                <p className="mb-5 text-[15px] text-fg-subtle">{subtitulo}</p>
                <ul className="mb-[26px] grid gap-2.5">
                  {itens.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[15px] text-fg-muted">
                      <IconCheck className="mt-1 h-[17px] w-[17px] flex-none text-lime" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mb-[18px] text-[13px] font-bold uppercase tracking-[.14em] text-fg-subtle">
                  Consulte os planos
                </p>
                <WhatsAppButton
                  href={href}
                  section={section}
                  icon={false}
                  className="mt-auto justify-center"
                >
                  {cta}
                </WhatsAppButton>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
