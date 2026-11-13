"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Moldura de foto com:
 *  • revelação em cortina ao entrar na tela
 *  • zoom suave (e mais forte no hover)
 *  • parallax: a foto se move mais devagar que a página
 * Sem `src`, mostra um painel com o monograma da marca.
 */
export function Photo({
  src,
  alt,
  ratio = "4/5",
  speed = 0.12,
  priority = false,
  className,
  label,
  children,
}: {
  src?: string | null;
  alt: string;
  ratio?: string;
  speed?: number;
  priority?: boolean;
  className?: string;
  /** Legenda exibida só quando não há foto (indica o que entra no espaço). */
  label?: string;
  children?: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    const box = outer.current;
    const layer = inner.current;
    if (!el || !box || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // revelação
    const startsVisible = box.getBoundingClientRect().top < window.innerHeight * 0.85;
    el.classList.add("ph-js");
    if (startsVisible) requestAnimationFrame(() => el.classList.add("ph-in"));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("ph-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    // observa o contêiner externo: o clip-path do próprio quadro esconderia o alvo do observer
    if (!startsVisible) io.observe(box);

    // parallax
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      layer.style.transform = `translate3d(0, ${(-offset * speed * r.height).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={outer} style={{ aspectRatio: ratio }} className={cn("relative", className)}>
    <div
      ref={frame}
      className="ph group absolute inset-0 isolate overflow-hidden rounded-[20px] bg-ink-card shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)] ring-1 ring-white/10"
    >
      {/* camada com parallax (maior que a moldura para não mostrar bordas) */}
      <div ref={inner} className="absolute inset-x-0 -inset-y-[9%] will-change-transform">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 560px, 92vw"
            priority={priority}
            className="ph-img object-cover"
          />
        ) : (
          <div className="ph-img absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_38%,#232a22_0%,#13161a_62%,#0c0e10_100%)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_50%_45%,#000,transparent_72%)]"
            />
            <Image
              src={siteConfig.logo}
              alt={alt}
              width={4311}
              height={2187}
              sizes="(min-width: 1024px) 380px, 70vw"
              priority={priority}
              className="relative w-[78%] drop-shadow-[0_20px_50px_rgba(168,255,31,.18)]"
            />
          </div>
        )}
      </div>

      {/* acabamento: vinheta + brilho de borda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-lime/0 transition-all duration-500 group-hover:ring-lime/40"
      />
      {!src && label && (
        <div className="absolute inset-x-0 bottom-0 p-4 text-center">
          <span className="inline-block rounded-full border border-lime/25 bg-ink/80 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-lime backdrop-blur">
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
    </div>
  );
}
