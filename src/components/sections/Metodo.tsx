import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MetodoTimeline } from "./MetodoTimeline";

const etapas = [
  { numero: "01", titulo: "Avaliação", texto: "Entendo seu objetivo, sua rotina, seu histórico e suas limitações." },
  { numero: "02", titulo: "Planejamento", texto: "Treino sob medida, com progressão definida desde o primeiro dia." },
  { numero: "03", titulo: "Acompanhamento", texto: "Execução correta, carga adequada e presença em todo o processo." },
  { numero: "04", titulo: "Ajustes", texto: "O treino muda quando você muda: revisões conforme a sua resposta." },
  { numero: "05", titulo: "Evolução", texto: "Resultado vem de continuidade, não de esforço isolado." },
] as const;

export function Metodo() {
  return (
    <section id="metodo" className="mx-auto max-w-[1240px] px-5 py-[clamp(52px,8vw,116px)]">
      <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <SectionLabel index="03">Método</SectionLabel>
          <h2 className="mb-5 font-serif text-[clamp(30px,4.2vw,54px)] font-bold leading-[1.06] text-fg">
            Bom treino não é{" "}
            <span className="italic text-lime">igual para todo mundo.</span>
          </h2>
          <p className="max-w-[40ch] text-lg text-fg-muted">
            Por isso o processo tem etapas claras — e todas passam por você.
          </p>
        </Reveal>

        <MetodoTimeline etapas={etapas} />
      </div>
    </section>
  );
}
