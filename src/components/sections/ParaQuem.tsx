import {
  IconClock,
  IconDumbbell,
  IconTrend,
  IconHeartPulse,
  IconStrength,
  IconClipboard,
  IconHeartCheck,
  IconBarChart,
} from "@/components/icons";
import { whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";

const perfis = [
  {
    Icon: IconClock,
    titulo: "Quer começar e não sabe por onde",
    texto: "Um plano claro desde o primeiro dia, sem achismo.",
  },
  {
    Icon: IconDumbbell,
    titulo: "Quer ganhar massa muscular",
    texto: "Estímulo, progressão de carga e recuperação organizados.",
  },
  {
    Icon: IconTrend,
    titulo: "Quer emagrecer com consistência",
    texto: "Treino sustentável, encaixado na sua rotina real.",
  },
  {
    Icon: IconHeartPulse,
    titulo: "Quer melhorar o condicionamento",
    texto: "Mais fôlego e disposição para o dia a dia.",
  },
  {
    Icon: IconStrength,
    titulo: "Quer mais força para a vida real",
    texto: "Subir escada, carregar peso, brincar com os filhos.",
  },
  {
    Icon: IconClipboard,
    titulo: "Quer um treino estruturado",
    texto: "Nada de repetir a mesma ficha por meses.",
  },
  {
    Icon: IconHeartCheck,
    titulo: "Quer acompanhamento profissional",
    texto: "Alguém olhando a execução, a carga e a sua evolução.",
  },
  {
    Icon: IconBarChart,
    titulo: "Quer acompanhar a própria evolução",
    texto: "Avaliação, registro e ajustes ao longo do caminho.",
  },
];

export function ParaQuem() {
  return (
    <Reveal>
      <section id="para-quem" className="mx-auto max-w-[1200px] px-5 py-[clamp(64px,8vw,116px)]">
        <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">Para quem é</p>
        <h2 className="mb-4 max-w-[20ch] font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.12] text-fg">
          Se você se reconhece aqui, o treino é para você
        </h2>
        <p className="mb-11 max-w-[56ch] text-fg-muted">
          Cada objetivo pede um caminho diferente. O ponto de partida é o seu.
        </p>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(255px,1fr))] gap-4">
          {perfis.map(({ Icon, titulo, texto }) => (
            <li
              key={titulo}
              className="rounded-2xl border border-fg/[.08] bg-ink-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/45"
            >
              <Icon className="h-[26px] w-[26px] text-lime" />
              <h3 className="mb-1.5 mt-4 text-[17px] font-bold text-fg">{titulo}</h3>
              <p className="text-[15px] text-fg-subtle">{texto}</p>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <p className="font-semibold text-fg-muted">
            Não sabe em qual você se encaixa? Me conta seu objetivo.
          </p>
          <WhatsAppButton
            href={whatsappLinks.objetivo}
            section="para-quem"
            variant="outline"
            icon={false}
          >
            Falar sobre o meu objetivo
          </WhatsAppButton>
        </div>
      </section>
    </Reveal>
  );
}
