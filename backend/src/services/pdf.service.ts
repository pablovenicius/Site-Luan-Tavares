// Geração de PDF com Puppeteer (Chromium headless).
// Mantém uma única instância do navegador aberta, criada no início do servidor,
// e uma página nova por PDF. Sem JavaScript na página, porque o recibo é só HTML e CSS.
import puppeteer, { type Browser } from 'puppeteer';

let browser: Browser | null = null;
let iniciando: Promise<Browser> | null = null;

async function obterBrowser(): Promise<Browser> {
  if (browser?.connected) return browser;
  // Evita abrir dois navegadores se duas requisições chegarem juntas.
  if (!iniciando) {
    iniciando = puppeteer
      .launch({
        headless: true,
        args: [
          // Necessário em containers Linux (Render/Docker).
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // Em containers /dev/shm é pequeno e o Chromium fica lento ou trava sem isto.
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
        ],
      })
      .then((b) => {
        browser = b;
        iniciando = null;
        return b;
      })
      .catch((err) => {
        iniciando = null;
        throw err;
      });
  }
  return iniciando;
}

/** Abre o Chromium antes da primeira requisição, para o primeiro PDF não demorar mais. */
export async function aquecerPdf(): Promise<void> {
  await obterBrowser();
}

/** Converte HTML em PDF A4. Retorna o conteúdo binário. */
export async function gerarPdf(html: string): Promise<Buffer> {
  const b = await obterBrowser();
  const page = await b.newPage();
  try {
    await page.setJavaScriptEnabled(false);
    // Sem scripts e com a logo embutida, a página já está pronta quando o DOM carrega.
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

/** Imagem PNG do recibo (largura de A4 em alta resolução). Serve para colar direto no WhatsApp. */
export async function gerarPng(html: string): Promise<Buffer> {
  const b = await obterBrowser();
  const page = await b.newPage();
  try {
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    // Dá respiro nas bordas: sem isto a imagem fica colada nas laterais no celular.
    const comMargem = html.replace(
      '</head>',
      '<style>body{margin:0;padding:40px 48px;background:#fff}</style></head>',
    );
    await page.setContent(comMargem, { waitUntil: 'domcontentloaded' });
    const png = await page.screenshot({ type: 'png', fullPage: true });
    return Buffer.from(png);
  } finally {
    await page.close();
  }
}

/** Fecha o navegador (chamado ao encerrar o servidor). */
export async function fecharPdf(): Promise<void> {
  await browser?.close();
  browser = null;
}
