"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/** Inclina o conteúdo em 3D acompanhando o mouse (só com mouse e sem "reduzir movimento"). */
export function Tilt({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={reset} className={className}>
      <div ref={ref} className="transition-transform duration-200 ease-out [transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}
