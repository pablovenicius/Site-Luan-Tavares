"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Contêiner com brilho que acompanha o cursor (efeito "spotlight"). */
export function Spot({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={cn("spot", className)}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}
