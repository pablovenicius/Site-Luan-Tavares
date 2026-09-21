import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** Controla o tamanho da imagem (ex.: "h-14 w-auto"). */
  imageClassName?: string;
  /** Classes extras para o box de fundo (raramente necessário mexer). */
  className?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
};

/**
 * O arquivo em public/images/logo-luan-tavares.png tem fundo transparente.
 * Este componente desenha o fundo do site (cor `ink`, a mesma do <body>)
 * atrás dele, para que a logo sempre apareça com o fundo escuro do site,
 * em qualquer seção — sem precisar de uma versão da imagem com fundo
 * já embutido.
 */
export function Logo({ imageClassName, className, priority, loading }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-ink px-3 py-2",
        className
      )}
    >
      <Image
        src={siteConfig.logo}
        alt={siteConfig.brand}
        width={1400}
        height={768}
        priority={priority}
        loading={priority ? undefined : loading}
        className={cn("block h-auto w-auto", imageClassName)}
      />
    </span>
  );
}
