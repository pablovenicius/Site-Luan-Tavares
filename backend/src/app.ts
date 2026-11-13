// Monta a aplicação Express: middlewares, rotas, login, frontend estático e tratamento de erros.
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { basicAuth } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import { hospedeRouter } from './routes/hospede.routes';
import { quartoRouter } from './routes/quarto.routes';
import { reciboRouter } from './routes/recibo.routes';
import { operacaoRouter } from './routes/operacao.routes';

export function createApp() {
  const app = express();

  const origens = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',');
  app.use(cors({ origin: origens }));
  app.use(express.json({ limit: '200kb' }));

  // Health check fica sem login, para o Railway conseguir verificar o serviço.
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // A partir daqui, toda rota /api exige usuário e senha. A tela de login e os arquivos
  // do frontend são públicos: não contêm dados, só o layout.
  app.use('/api', basicAuth);

  app.use('/api/quartos', quartoRouter);
  app.use('/api/recibos', reciboRouter);
  app.use('/api/hospedes', hospedeRouter);
  app.use('/api/operacao', operacaoRouter);

  // Em produção, o build do frontend (frontend/dist) é servido pela mesma porta.
  // Em desenvolvimento a pasta não existe e isso é ignorado.
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // Qualquer rota que não seja /api devolve o index.html (aplicação de página única).
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Deve ficar por último para capturar erros de todas as rotas.
  app.use(errorHandler);

  return app;
}
