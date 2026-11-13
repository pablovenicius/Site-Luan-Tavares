// Link de conversa no WhatsApp (wa.me). Aceita telefone com ou sem DDI 55.

/** Monta o link wa.me com o texto já preenchido. Sem telefone, abre a escolha de contato. */
export function linkWhatsapp(telefone: string | null | undefined, texto: string): string {
  let digitos = (telefone ?? '').replace(/\D/g, '');
  if (digitos && !digitos.startsWith('55')) digitos = `55${digitos}`;
  // WhatsApp Web direto, para não abrir o aplicativo de computador.
  return digitos
    ? `https://web.whatsapp.com/send?phone=${digitos}${texto ? `&text=${encodeURIComponent(texto)}` : ''}`
    : 'https://web.whatsapp.com/';
}

/** Primeiro nome, para a saudação. */
export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? '';
