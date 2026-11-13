import { siteConfig } from "@/config/site";
import { Photo } from "@/components/ui/Photo";

/** Foto do Luan sozinha: sobe com efeito de cortina, zoom suave e parallax (via <Photo>). */
export function Sobre() {
  return (
    <section id="luan" className="relative isolate overflow-hidden px-5 py-[clamp(52px,8vw,116px)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70%] w-[min(90%,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[.10] blur-[110px]"
      />
      <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px]">
        <div
          aria-hidden="true"
          className="absolute -inset-4 -z-10 rotate-2 rounded-[28px] border border-lime/20 sm:-inset-5"
        />
        <Photo
          src={siteConfig.photos.sobre}
          alt="Luan Tavares, personal trainer"
          ratio="4/5"
          speed={0.16}
          label="Foto do Luan"
        />
      </div>
    </section>
  );
}
