import { siteConfig } from "@/config/site";

/**
 * Monta a URL do wa.me a partir do número configurado.
 * Só usa o número quando ele é um telefone válido (12–15 dígitos);
 * caso contrário mantém o placeholder visível na URL, igual ao original.
 */
export function buildWhatsAppUrl(message: string): string {
  const digits = siteConfig.whatsapp.replace(/\D/g, "");
  const num = /^\d{12,15}$/.test(digits) ? digits : siteConfig.whatsapp;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  geral: "Olá, Luan! Vim pelo site e quero saber mais sobre o treino personalizado.",
  objetivo:
    "Olá, Luan! Vim pelo site e quero conversar sobre qual treino combina com o meu objetivo.",
  presencial:
    "Olá, Luan! Vim pelo site e quero treinar presencial. Pode me falar sobre os planos de acompanhamento?",
  online: "Olá, Luan! Vim pelo site e tenho interesse na consultoria online. Como funciona?",
  avaliacao: "Olá, Luan! Vim pelo site e gostaria de agendar uma avaliação física.",
} as const;

export const whatsappLinks = {
  geral: buildWhatsAppUrl(whatsappMessages.geral),
  objetivo: buildWhatsAppUrl(whatsappMessages.objetivo),
  presencial: buildWhatsAppUrl(whatsappMessages.presencial),
  online: buildWhatsAppUrl(whatsappMessages.online),
  avaliacao: buildWhatsAppUrl(whatsappMessages.avaliacao),
} as const;

/** Mensagem final enviada pelo formulário de contato. */
export function buildContactMessage(nome: string, objetivo: string, modalidade: string): string {
  return `Olá, Luan! Sou ${nome}. Meu objetivo é ${objetivo} e tenho interesse em ${modalidade}. Vim pelo site e quero saber mais sobre os planos de acompanhamento.`;
}
