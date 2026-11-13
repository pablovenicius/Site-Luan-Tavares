# Pousada Aruamar · Recibos e Pré-reservas

Monorepo com API (Node.js + Express + TypeScript + Prisma/SQLite + Puppeteer) e frontend (React + TypeScript + Tailwind).

```
aruamar-app/
├── backend/   API REST, banco SQLite e geração de PDF
└── frontend/  Formulário de recibo e pré-reserva (Vite + React)
```

## Como rodar

```bash
# 1. API
cd backend
cp .env.example .env          # ajuste PIX_CHAVE, POUSADA_CNPJ etc.
npm install                   # baixa também o Chromium do Puppeteer
npx prisma migrate dev --name init
npm run db:seed               # cadastra as 10 suítes
npm run dev                   # http://localhost:3333

# 2. Frontend (outro terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxy /api → 3333)
```

## Endpoints

| Método | Rota                    | Descrição                                   |
|--------|-------------------------|---------------------------------------------|
| GET    | `/api/health`           | Status da API                               |
| GET    | `/api/quartos`          | Lista das 10 suítes                         |
| POST   | `/api/recibos`          | Cria um RECIBO ou uma PRE_RESERVA           |
| GET    | `/api/recibos/:id/pdf`  | Gera o PDF do documento (Puppeteer)         |

## Regras de negócio implementadas

- CPF e CNPJ validados por dígito verificador.
- Pré-reserva bloqueia a suíte se já houver reserva não cancelada no mesmo período (409).
- Sinal não pode ser maior que o total da estadia (422).
- Validade da pré-reserva até o check-in; check-out depois do check-in.
- Hóspede é identificado pelo documento (upsert).
- Numeração independente para recibos e pré-reservas.
- Valores são guardados em centavos (inteiros).
