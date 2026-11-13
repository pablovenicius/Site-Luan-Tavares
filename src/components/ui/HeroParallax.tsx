"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * No celular o Hero fica fixo e o resto da página desliza por cima (efeito
 * "cortina"). Enquanto isso o conteúdo do Hero sobe devagar, diminui um
 * pouco e some. No desktop não faz nada.
 */
export function HeroParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const apply = () => {
      raf = 0;
      if (!mq.matches || reduce.matches) {
        el.style.transform = "";
        el.style.opacity = "";
        return;
      }
      const p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.85), 0), 1);
      el.style.transform = `translate3d(0,${-p * 70}px,0) scale(${1 - p * 0.07})`;
      el.style.opacity = String(1 - p * 1.1 < 0 ? 0 : 1 - p * 1.1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ transformOrigin: "50% 100%", willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
