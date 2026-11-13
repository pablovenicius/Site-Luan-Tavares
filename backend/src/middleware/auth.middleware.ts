// Login com usuário e senha fixos (HTTP Basic Auth).
// Credenciais vêm das variáveis ADMIN_USER e ADMIN_PASSWORD. Nunca ficam no código.
// Em produção (NODE_ENV=production) o servidor recusa responder sem essas variáveis.
import { timingSafeEqual } from 'crypto';
import type { RequestHandler } from 'express';

/** Comparação em tempo constante, para não vazar informação pelo tempo de resposta. */
function iguais(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export const basicAuth: RequestHandler = (req, res, next) => {
  const usuario = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASSWORD;

  if (!usuario || !senha) {
    if (process.env.NODE_ENV === 'production') {
      res.status(500).send('Login não configurado: defina ADMIN_USER e ADMIN_PASSWORD.');
      return;
    }
    // Em desenvolvimento, sem variáveis definidas, o login fica desligado.
    next();
    return;
  }

  const [esquema, codificado] = (req.headers.authorization ?? '').split(' ');
  if (esquema === 'Basic' && codificado) {
    const decodificado = Buffer.from(codificado, 'base64').toString('utf8');
    const separador = decodificado.indexOf(':');
    if (separador !== -1) {
      const u = decodificado.slice(0, separador);
      const p = decodificado.slice(separador + 1);
      if (iguais(u, usuario) && iguais(p, senha)) {
        next();
        return;
      }
    }
  }

  // O navegador mostra a janela de login ao receber 401 com este cabeçalho.
  res.setHeader('WWW-Authenticate', 'Basic realm="Pousada Aruamar", charset="UTF-8"');
  res.status(401).send('Autenticação necessária');
};
