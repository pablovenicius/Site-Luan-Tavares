// Dados da pousada que aparecem no cabeçalho, no PDF e na política de cancelamento.
// Podem ser sobrescritos pelo .env (POUSADA_CNPJ, POUSADA_ENDERECO, PIX_CHAVE).
export const POUSADA = {
  nome: 'Pousada Aruamar',
  cidade: 'Aracaju/SE',
  cnpj: process.env.POUSADA_CNPJ ?? '03.584.561/0001-73',
  endereco: process.env.POUSADA_ENDERECO ?? 'Rua Evaldo Campos Junior, 564 – Aruana, Aracaju – SE',
  telefone: '(79) 99936-1548',
  email: 'aruapousada@gmail.com',
  pix: process.env.PIX_CHAVE ?? '03.584.561/0001-73',
  politica:
    'Cancelamentos com até 7 dias de antecedência têm o sinal devolvido integralmente. ' +
    'Após esse prazo, o sinal não é reembolsável, podendo ser convertido em crédito para nova data.',
} as const;
