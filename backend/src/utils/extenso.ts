// Converte centavos em valor por extenso: 15050 → "Cento e cinquenta reais e cinquenta centavos".
// Cobre valores até 999.999 reais, suficiente para recibos de pousada.

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function ateNovecentosNoventaNove(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]);
  if (r) partes.push(r < 20 ? UNIDADES[r] : DEZENAS[Math.floor(r / 10)] + (r % 10 ? ` e ${UNIDADES[r % 10]}` : ''));
  return partes.join(' e ');
}

export function valorPorExtenso(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const cent = centavos % 100;
  const milhares = Math.floor(reais / 1000);
  const resto = reais % 1000;

  const partes: string[] = [];
  if (milhares) partes.push(milhares === 1 ? 'mil' : `${ateNovecentosNoventaNove(milhares)} mil`);
  if (resto) partes.push(ateNovecentosNoventaNove(resto));

  let texto = partes.join(' e ') || 'zero';
  texto += reais === 1 ? ' real' : ' reais';
  if (cent) texto += ` e ${ateNovecentosNoventaNove(cent)} ${cent === 1 ? 'centavo' : 'centavos'}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
