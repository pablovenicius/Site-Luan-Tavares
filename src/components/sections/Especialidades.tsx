import { Reveal } from "@/components/ui/Reveal";

const especialidades = [
  "Hipertrofia e ganho de massa",
  "Emagrecimento e redução de gordura",
  "Condicionamento físico",
  "Fortalecimento muscular",
  "Resistência e desempenho físico",
  "Treinamento funcional",
  "Treinamento para iniciantes",
  "Treino personalizado conforme o objetivo",
];

export function Especialidades() {
  return (
    <Reveal>
      <section className="mx-auto max-w-[1200px] px-5 py-[clamp(56px,7vw,96px)]">
        <p className="mb-3.5 text-xs font-bold uppercase tracking-[.24em] text-lime">
          Especialidades
        </p>
        <h2 className="mb-[34px] font-serif text-[clamp(26px,3.6vw,42px)] font-bold leading-[1.15] text-fg">
          Onde eu posso te ajudar
        </h2>
        <ul className="flex flex-wrap gap-3">
          {especialidades.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-2.5 rounded-full border border-fg/10 bg-ink-card px-5 py-3 text-[15px] font-semibold text-fg"
            >
              <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 bg-lime" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
