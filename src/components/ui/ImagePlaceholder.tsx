/**
 * Placeholder para os dois slots de foto do site original (hero 4:5 e
 * "sobre" 3:4). Nenhuma foto profissional foi enviada junto com o HTML,
 * então este componente marca visualmente onde ela deve entrar.
 *
 * Para usar uma foto real, troque o uso deste componente por:
 *
 *   import Image from "next/image";
 *   <Image src="/images/hero-luan.jpg" alt="Luan Tavares treinando"
 *          fill className="object-cover" />
 *
 * dentro de um container com posição relativa (mesma estrutura que já
 * envolve <ImagePlaceholder /> em cada seção).
 */
export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed border-lime/25 bg-ink-card p-6 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        className="h-9 w-9 text-fg-subtle"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.8 0L3 20" />
      </svg>
      <p className="max-w-[22ch] text-xs font-medium leading-relaxed text-fg-subtle">{label}</p>
    </div>
  );
}
