import { Reveal } from "@/components/ui/Reveal";

const etapas = [
  {
    numero: "01",
    titulo: "Avaliação",
    texto: "Entendo seu objetivo, sua rotina, seu histórico e suas limitações.",
    opacidade: "opacity-90",
  },
  {
    numero: "02",
    titulo: "Planejamento personalizado",
    texto: "Montagem do treino sob medida, com progressão definida.",
    opacidade: "opacity-75",
  },
  {
    numero: "03",
    titulo: "Acompanhamento",
    texto: "Execução correta, carga adequada e presença no processo.",
    opacidade: "opacity-[.55]",
  },
  {
    numero: "04",
    titulo: "Ajustes",
    texto: "O treino muda quando você muda. Revisões conforme a resposta.",
    opacidade: "opacity-40",
  },
  {
    numero: "05",
    titulo: "Evolução consistente",
    texto: "Resultado vem de continuidade, não de esforço isolado.",
    opacidade: "opacity-25",
  },
];

export function Metodo() {
  return (
    <Reveal>
      <section id="metodo" className="mx-auto max-w-[1200px] px-5 py-[clamp(64px,8vw,116px)]">
        <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">
          Método de trabalho
        </p>
        <h2 className="mb-4 max-w-[22ch] font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.12] text-fg">
          Um bom treinamento não deve ser igual para todo mundo
        </h2>
        <p className="mb-12 max-w-[54ch] text-fg-muted">
          Por isso o processo tem etapas claras — e todas passam por você.
        </p>

        <ol className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-5">
          {etapas.map(({ numero, titulo, texto, opacidade }) => (
            <li
              key={numero}
              className="rounded-b-2xl rounded-t border border-fg/[.08] border-t-2 border-t-lime bg-ink-card px-[22px] py-7"
            >
              <span className={`font-serif text-4xl font-bold leading-none text-lime ${opacidade}`}>
                {numero}
              </span>
              <h3 className="mb-2 mt-3 text-lg font-bold text-fg">{titulo}</h3>
              <p className="text-[15px] text-fg-subtle">{texto}</p>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}
