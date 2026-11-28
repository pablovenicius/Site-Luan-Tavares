import type { ReactNode } from "react";

/** Rótulo de seção: linha + nome. */
export function SectionLabel({ children }: { index?: string; children: ReactNode }) {
  return (
    <p className="mb-5 flex items-center gap-3 text-[14px] font-medium text-lime">
      <span className="h-px w-8 bg-lime/60" />
      {children}
    </p>
  );
}
