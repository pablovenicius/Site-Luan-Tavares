import Image from "next/image";
import "./assinatura.css";

type Props = {
  /** Nome do projeto, usado na mensagem do WhatsApp: "Vi o site X e gostaria de conversar…" */
  projeto?: string;
  /** "escuro" (padrão) para fundos escuros, "claro" para fundos claros */
  tema?: "escuro" | "claro";
  /** Alinha à esquerda (menus laterais). Padrão: centralizado. */
  esquerda?: boolean;
  /** Pasta pública onde estão os SVGs */
  pasta?: string;
  className?: string;
};

const WHATSAPP = "5579999698750";
const INSTAGRAM = "pablocarvalho__";

/** Assinatura "Desenvolvido por Pablo Carvalho" (manual de marca v4). */
export function DevCredit({
  projeto = "seu projeto",
  tema = "escuro",
  esquerda = false,
  pasta = "/assinatura/assets",
  className = "",
}: Props) {
  const msg = encodeURIComponent(`Olá, Pablo! Vi ${projeto} e gostaria de conversar sobre um projeto.`);
  const logo = `${pasta}/pablo-carvalho-${tema === "claro" ? "fundo-claro" : "fundo-escuro"}.svg`;
  return (
    <div
      className={`pc-assinatura${tema === "claro" ? " pc-claro" : ""}${esquerda ? " pc-esq" : ""} ${className}`.trim()}
    >
      <p className="pc-rotulo">Desenvolvido por</p>
      <a
        className="pc-logo"
        href={`https://instagram.com/${INSTAGRAM}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pablo Carvalho, desenvolvedor full-stack (abre o Instagram)"
      >
        <Image src={logo} alt="Pablo Carvalho" width={122} height={24} unoptimized />
      </a>
      <div className="pc-icones">
        <a
          href={`https://wa.me/${WHATSAPP}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com Pablo Carvalho no WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.2 20.8l1.5-4.6A8.7 8.7 0 1 1 8 19.5z" />
            <path d="M9.2 8.6c-.3 1.9 1.2 4.2 3 5.4 1.1.7 2.2 1 3.2.5l.7-1.4-2-1-.9.8c-.9-.4-1.8-1.3-2.3-2.2l.8-.9-1-2z" />
          </svg>
        </a>
        <a
          href={`https://instagram.com/${INSTAGRAM}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Pablo Carvalho (@pablocarvalho__)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <path d="M17.2 6.8h.01" />
          </svg>
        </a>
      </div>
    </div>
  );
}
