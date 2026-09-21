"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Revelação suave ao entrar na viewport — só aplica a quem já
 * começa fora da tela, sem flash de conteúdo (mesmo comportamento
 * do runtime original). Respeita prefers-reduced-motion.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top <= window.innerHeight) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";
    el.style.transition = "opacity .55s ease, transform .55s ease";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
