# Imagem única: builda o frontend, compila o backend e serve tudo na mesma porta.
# Usada no Render (e serve em qualquer host que aceite Docker).
FROM node:20-bookworm-slim

# Chromium do sistema, usado pelo Puppeteer para gerar os PDFs.
RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium fonts-liberation ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# NODE_ENV fica de fora da instalação: com "production", o npm ci ignora as devDependencies
# (tsc, vite, prisma CLI, tsx), que o build e a inicialização precisam.
ENV PUPPETEER_SKIP_DOWNLOAD=1 \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Frontend: instala (com devDependencies) e gera o build estático em frontend/dist
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci
COPY frontend/ frontend/
RUN cd frontend && npm run build

# Backend: instala (com devDependencies), gera o cliente Prisma e compila
COPY backend/package*.json backend/
RUN cd backend && npm ci
COPY backend/ backend/
RUN cd backend && npx prisma generate && npm run build

WORKDIR /app/backend

# Banco SQLite em /data (disco persistente no Render).
ENV DATABASE_URL=file:/data/aruamar.db \
    PORT=3333 \
    NODE_ENV=production

EXPOSE 3333

# A cada deploy: aplica migrações, cadastra as suítes (idempotente) e sobe o servidor.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && node dist/server.js"]
