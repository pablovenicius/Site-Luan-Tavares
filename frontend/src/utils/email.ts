// Link mailto: abre o programa de e-mail com destinatário, assunto e texto já preenchidos.

/** Monta o link mailto. Sem e-mail, abre o programa com o destinatário em branco. */
export function linkEmail(email: string | null | undefined, assunto: string, corpo: string): string {
  const para = (email ?? '').trim();
  return `mailto:${encodeURIComponent(para)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}
