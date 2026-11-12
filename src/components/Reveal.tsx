"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale" | "fade";

/**
 * Revela o conteúdo ao entrar na tela. Só atua em quem começa fora da
 * viewport (sem flash) e respeita prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("rv", variant === "fade" ? "rv-fade" : `rv-${variant}`);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("rv-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variant, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
