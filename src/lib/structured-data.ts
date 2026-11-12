import { siteConfig } from "@/config/site";

export const faqItems = [
  {
    pergunta: "Como funciona a consultoria online?",
    resposta:
      "Você recebe o treino personalizado por aplicativo, com vídeos demonstrativos, orientações para treinar com segurança e acompanhamento à distância.",
  },
  {
    pergunta: "Como funciona o acompanhamento presencial?",
    resposta:
      "As sessões são individuais. Acompanho o treino do início ao fim, corrijo a execução e ajusto carga e planejamento conforme a sua evolução.",
  },
  {
    pergunta: "Preciso ter experiência para começar?",
    resposta:
      "Não. O treino parte do seu nível atual, da sua rotina e do seu objetivo. Quem nunca treinou começa do começo, com orientação em cada exercício.",
  },
  {
    pergunta: "E se eu tiver limitações ou lesões?",
    resposta:
      "O planejamento considera suas limitações. Em caso de lesão, dor ou condição de saúde, recomendo a liberação médica antes de iniciar e adapto os exercícios à orientação recebida.",
  },
  {
    pergunta: "Como é a avaliação física?",
    resposta:
      "É uma conversa somada a medições e testes simples para entender seu estado atual. Serve de base para o planejamento e para acompanhar a sua evolução.",
  },
  {
    pergunta: "Onde você atende?",
    resposta: `A consultoria online atende qualquer cidade do Brasil. O atendimento presencial é em ${siteConfig.city} e região.`,
  },
] as const;

export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "#negocio",
        name: siteConfig.brand,
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        description: `Consultoria online de treino personalizado para todo o Brasil e atendimento presencial em ${siteConfig.city}.`,
        telephone: `+${siteConfig.whatsapp}`,
        areaServed: siteConfig.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.city,
          addressRegion: "SE",
          addressCountry: "BR",
        },
        sameAs: [`https://instagram.com/${siteConfig.instagram}`],
      },
      {
        "@type": "Person",
        name: siteConfig.name,
        jobTitle: siteConfig.role,
        worksFor: { "@id": "#negocio" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.pergunta,
          acceptedAnswer: { "@type": "Answer", text: item.resposta },
        })),
      },
    ],
  };
}
