import { siteConfig } from "@/config/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

const ratios = ["3/4", "4/5", "3/4", "4/5", "3/4", "4/5"];
const speeds = [0.08, 0.18, 0.1, 0.16, 0.08, 0.18];

/** Só aparece quando há fotos em siteConfig.photos.galeria. */
export function Galeria() {
  const fotos = siteConfig.photos.galeria;
  if (fotos.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-[clamp(80px,10vw,150px)]">
      <Reveal className="mb-12">
        <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-lime">
          <span className="h-px w-10 bg-lime" />
          No dia a dia
        </p>
        <h2 className="font-serif text-[clamp(32px,4.6vw,60px)] font-bold leading-[1.06] text-fg">
          Treino <span className="italic text-lime">na prática.</span>
        </h2>
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fotos.map((f, i) => (
          <Photo
            key={f.src}
            src={f.src}
            alt={f.alt}
            ratio={ratios[i % ratios.length] ?? "4/5"}
            speed={speeds[i % speeds.length] ?? 0.1}
            className={i % 3 === 1 ? "lg:mt-14" : ""}
          />
        ))}
      </div>
    </section>
  );
}
