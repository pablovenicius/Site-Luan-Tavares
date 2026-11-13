// Ponto de entrada: sobe o servidor HTTP e encerra recursos com segurança.
import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './lib/prisma';
import { aquecerPdf, fecharPdf } from './services/pdf.service';

const port = Number(process.env.PORT) || 3333;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`API Aruamar rodando em http://localhost:${port}`);
  // Abre o Chromium já na subida, para o primeiro PDF sair rápido.
  aquecerPdf().catch((err) => console.error('[pdf] falha ao aquecer o Chromium:', err));
});

// Fecha o Chromium do Puppeteer e a conexão com o banco ao encerrar.
async function encerrar() {
  server.close();
  await fecharPdf();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
