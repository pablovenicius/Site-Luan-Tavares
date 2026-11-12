/**
 * Dados do negócio, centralizados aqui para facilitar a edição.
 */
export const siteConfig = {
  name: "Luan Tavares",
  role: "Personal Trainer",
  brand: "Luan Tavares – Personal Trainer",

  // SEO
  title: "Consultoria Online de Treino | Luan Tavares – Personal Trainer em Aracaju",
  description:
    "Consultoria online de treino personalizado com aplicativo próprio, para qualquer cidade do Brasil, com o personal trainer Luan Tavares. Também atende presencial em Aracaju. Fale no WhatsApp.",
  // Domínio final de produção. Defina NEXT_PUBLIC_SITE_URL na hospedagem (ou troque aqui).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.seudominio.com.br",

  // Atendimento
  city: "Aracaju",
  cref: "004777-G/SE",

  // Contato — apenas dígitos, com DDI 55 + DDD + número
  whatsapp: "5579991516767",
  whatsappDisplay: "(79) 99151-6767",
  instagram: "luantavarespersonal",
  instagramUrl: "https://instagram.com/luantavarespersonal",

  // Ativos
  logo: "/images/logo-luan-tavares-hd.webp", // logo completa (4311×2187, fundo transparente)
  ogImage: "/images/og-image.jpg",

  /**
   * FOTOS — coloque os arquivos em public/images/ e informe o caminho abaixo.
   * Enquanto o campo estiver vazio, o site mostra um painel com a marca.
   * A seção de fotos tem 6 vagas (Luan e alunos); vaga sem foto mostra a marca.
   */
  photos: {
    hero: null as string | null, // ex.: "/images/hero-luan.jpg"  (vertical 4:5)
    sobre: null as string | null, // ex.: "/images/sobre-luan.jpg" (vertical 4:5)
    // Fotos do Luan e dos alunos. Enquanto estiver vazio, aparecem 3 espaços reservados.
    // ex.: [{ src: "/images/treino-1.jpg", alt: "Luan orientando um aluno" }]
    // ex.: [{ src: "/images/luan-1.jpg", alt: "Luan Tavares", legenda: "Luan" }, { src: "/images/aluno-1.jpg", alt: "Treino com aluno", legenda: "Com aluno" }]
    galeria: [] as { src: string; alt: string; legenda?: string }[],
  },
};

export const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#app", label: "Aplicativo" },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#fotos", label: "Fotos" },
  { href: "#faq", label: "Dúvidas" },
] as const;
