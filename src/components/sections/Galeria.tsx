import { siteConfig } from "@/config/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

const ratios = ["4/5", "3/4", "3/4", "4/5", "4/5", "3/4"];
const speeds = [0.08, 0.16, 0.1, 0.14, 0.08, 0.16];
const legendasPadrao = ["Luan", "Luan treinando", "Com aluno", "Com aluna", "Treino na prática", "Resultado"];
const VAGAS = 6;

/** Mostra até 6 vagas de foto. Vagas sem foto exibem a marca, prontas para receber as imagens. */
export function Galeria() {
  const fotos = siteConfig.photos.galeria;
  const total = Math.max(VAGAS, fotos.length);

  return (
    <section id="fotos" className="mx-auto max-w-[1240px] px-5 pb-[clamp(52px,8vw,116px)]">
      <Reveal className="mb-9 max-w-[720px] sm:mb-12">
        <SectionLabel index="05">Fotos</SectionLabel>
        <h2 className="font-serif text-[clamp(30px,4.2vw,54px)] font-bold leading-[1.06] text-fg">
          Luan e seus <span className="italic text-lime">alunos.</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: total }).map((_, i) => {
          const f = fotos[i];
          const legenda = f?.legenda ?? legendasPadrao[i] ?? "Treino";
          return (
            <Photo
              key={f?.src ?? `vaga-${i}`}
              src={f?.src ?? null}
              alt={f?.alt ?? legenda}
              ratio={ratios[i % ratios.length] ?? "4/5"}
              speed={speeds[i % speeds.length] ?? 0.1}
              className={i % 3 === 1 ? "lg:mt-14" : ""}
            >
              <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-ink/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-lime backdrop-blur-xl">
                {legenda}
              </span>
            </Photo>
          );
        })}
      </div>
    </section>
  );
}
