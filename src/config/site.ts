/**
 * Dados do negócio, centralizados aqui para facilitar a edição.
 * Troque os placeholders entre colchetes pelos dados reais do Luan.
 */
export const siteConfig = {
  name: "Luan Tavares",
  role: "Personal Trainer",
  brand: "Luan Tavares – Personal Trainer",

  // SEO
  title: "Personal Trainer em [CIDADE] | Luan Tavares – Presencial e Online",
  description:
    "Luan Tavares, Personal Trainer em [CIDADE]. Treino personalizado presencial e consultoria online para hipertrofia, emagrecimento e condicionamento. Fale no WhatsApp.",
  // URL final de produção (ajuste antes do deploy — usada em metadata/OG e no JSON-LD)
  url: "https://www.seudominio.com.br",

  // Dados de atendimento
  city: "[CIDADE]",
  neighborhoods: "[BAIRROS/REGIÕES]",
  cref: "[inserir número]",

  // Contato — apenas dígitos, com DDI 55 + DDD + número (ex.: 5579999999999)
  whatsapp: "55[WHATSAPP]",
  instagram: "[INSTAGRAM]",

  // Ativos
  logo: "/images/logo-luan-tavares.png",
} as const;

export const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#para-quem", label: "Para quem é" },
  { href: "#contato", label: "Contato" },
] as const;

export const footerLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#faq", label: "Dúvidas" },
] as const;
