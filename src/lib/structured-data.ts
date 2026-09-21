import { siteConfig } from "@/config/site";

export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "#negocio",
        name: siteConfig.brand,
        image: `${siteConfig.url}${siteConfig.logo}`,
        description: `Personal trainer em ${siteConfig.city}. Treino personalizado presencial e consultoria online.`,
        telephone: `+${siteConfig.whatsapp}`,
        areaServed: siteConfig.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.city,
          addressCountry: "BR",
        },
        sameAs: [`https://instagram.com/${siteConfig.instagram}`],
        priceRange: "$$",
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

export const faqItems = [
  {
    pergunta: "Como funciona o acompanhamento presencial?",
    resposta:
      "As sessões são individuais e personalizadas. Acompanho o treino do início ao fim, corrijo a execução dos exercícios e ajusto a carga e o planejamento conforme a sua evolução.",
  },
  {
    pergunta: "Como funciona a consultoria online?",
    resposta:
      "Você recebe um treino personalizado por aplicativo, com acesso aos exercícios, vídeos demonstrativos e orientações para treinar com segurança e autonomia, além de acompanhamento à distância.",
  },
  {
    pergunta: "Preciso ter experiência para começar?",
    resposta:
      "Não. O treino é montado a partir do seu nível atual, da sua rotina e do seu objetivo. Quem nunca treinou começa do começo, com orientação em cada exercício.",
  },
  {
    pergunta: "E se eu tiver limitações ou lesões?",
    resposta:
      "O planejamento considera suas limitações. Em casos de lesão, dor ou condição de saúde, recomendo a liberação médica antes de iniciar e adapto os exercícios conforme a orientação recebida.",
  },
  {
    pergunta: "Como é a avaliação física?",
    resposta:
      "É uma conversa somada a medições e testes simples para entender seu estado atual. Serve de base para o planejamento e para acompanhar a sua evolução ao longo do tempo.",
  },
  {
    pergunta: "Como faço para começar?",
    resposta:
      "Basta chamar no WhatsApp. Conversamos sobre seu objetivo, sua rotina e a modalidade ideal, e a partir daí montamos o planejamento.",
  },
  {
    pergunta: "Onde você atende?",
    resposta:
      "Atendimento presencial em [CIDADE] e região ([BAIRROS/REGIÕES]). A consultoria online atende qualquer cidade.",
  },
] as const;
