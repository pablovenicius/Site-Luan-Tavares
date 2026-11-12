import { siteConfig } from "@/config/site";

/** Monta a URL do wa.me a partir do número configurado. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  geral: "Olá, Luan! Vim pelo site e quero saber mais sobre a consultoria online.",
  presencial:
    "Olá, Luan! Vim pelo site e quero treinar presencial. Pode me falar sobre os planos de acompanhamento?",
  online: "Olá, Luan! Vim pelo site e tenho interesse na consultoria online. Como funciona?",
} as const;

export const whatsappLinks = {
  geral: buildWhatsAppUrl(whatsappMessages.geral),
  presencial: buildWhatsAppUrl(whatsappMessages.presencial),
  online: buildWhatsAppUrl(whatsappMessages.online),
} as const;

/** Mensagem final enviada pelo formulário de contato. */
export function buildContactMessage(nome: string, objetivo: string, modalidade: string): string {
  return `Olá, Luan! Sou ${nome}. Meu objetivo é ${objetivo} e tenho interesse em ${modalidade}. Vim pelo site e quero saber mais sobre os planos de acompanhamento.`;
}
