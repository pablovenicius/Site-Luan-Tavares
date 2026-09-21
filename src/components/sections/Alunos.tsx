import { IconQuote } from "@/components/icons";
import { Reveal } from "@/components/ui/Reveal";

export function Alunos() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[1200px] px-5 py-[clamp(64px,8vw,116px)]">
        <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">Alunos</p>
        <h2 className="mb-4 font-serif text-[clamp(28px,4vw,48px)] font-bold leading-[1.12] text-fg">
          Quem treina, conta
        </h2>
        <p className="mb-10 max-w-[54ch] text-fg-muted">
          Espaço reservado para depoimentos reais de alunos. Substitua os textos abaixo.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
          {[0, 1, 2].map((i) => (
            <figure
              key={i}
              className="rounded-2xl border border-dashed border-lime/35 bg-ink-card px-[26px] py-[30px]"
            >
              <IconQuote className="h-7 w-7 text-lime" strokeWidth={1.5} />
              <blockquote className="my-4 italic text-fg-muted">
                [substituir por depoimento real do aluno]
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="block h-[42px] w-[42px] rounded-full border border-fg/10 bg-ink-alt"
                />
                <span className="text-sm text-fg-subtle">
                  <strong className="block font-bold text-fg">[Nome do aluno]</strong>
                  [objetivo / tempo de treino]
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
