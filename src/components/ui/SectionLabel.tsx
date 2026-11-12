import type { ReactNode } from "react";

/** Rótulo de seção no estilo "painel técnico": índice + linha + nome. */
export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="mb-5 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[.3em] text-lime">
      <span className="text-fg-faint">{index}</span>
      <span className="h-px w-8 bg-lime/60" />
      {children}
    </p>
  );
}
