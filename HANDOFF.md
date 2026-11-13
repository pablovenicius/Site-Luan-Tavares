# Handoff: sistema de recibos e pré-reservas (base do projeto Aruamar)

Use este documento como primeira mensagem de um chat novo para criar um sistema
parecido para outra empresa. Ele descreve o que existe, como está organizado, o que
é específico da Pousada Aruamar e o que precisa mudar. Anexe também o `aruamar-app.zip`
mais recente, para o chat novo ter o código.

---

## 1. Resumo do produto

Sistema interno (uso da recepção) para emitir:
- **Pré-reserva**: reserva de uma suíte com sinal (valor pago antecipado), datas, diária e total.
- **Recibo**: comprovante de pagamento, com valor por extenso.

Recursos principais:
- Busca de hóspedes e empresas na API da QuartoVerde (sistema de hotelaria da pousada).
  Ao escolher o hóspede, preenche nome, documento, telefone, e-mail, endereço, cidade, UF, CEP,
  suíte, check-in, check-out, adultos, crianças, diária (total ÷ noites) e sinal (valor já pago).
- Geração de PDF (A4) com Puppeteer, com nome "Nome do Cliente - Recibo" ou "... - Pré-reserva".
- Imagem PNG do documento para copiar e colar no WhatsApp Web.
- Envio do PDF por e-mail (mailto ou compartilhamento nativo no celular).
- Impressão direta do PDF.
- Aba "Reservas do dia": chegadas, hóspedes na casa e saídas do dia, com saldo.
- Login com e-mail e senha fixos (variáveis de ambiente), sessão salva no navegador até clicar em Sair.

---

## 2. Stack e versões

Monorepo em duas pastas:

| Parte | Tecnologia |
|---|---|
| Backend | Node 20, Express 5, TypeScript, Prisma 5 com SQLite, zod, dotenv, cors, Puppeteer 23 |
| Frontend | React 18, Vite 5, TypeScript, Tailwind 3 |
| Banco | SQLite (arquivo em disco persistente: `/data/aruamar.db` no Render) |
| Deploy | Render (Web Service, Docker, plano **Starter** para ter disco persistente) |
| Repositório | GitHub, com deploy automático a cada push |

O frontend é compilado (`frontend/dist`) e servido pelo próprio Express, na mesma porta.
Só as rotas `/api/*` são protegidas por login; a página e os arquivos estáticos são públicos.

---

## 3. Estrutura de pastas

```
aruamar-app/
├─ Dockerfile                  build do frontend + backend; CMD roda db push, seed e servidor
├─ .dockerignore / .gitignore  ignoram node_modules, dist, .env, *.db
├─ README.md
├─ backend/
│  ├─ .env.example             variáveis (ver seção 6)
│  ├─ assets/                  logo-aruamar.jpg (site) e logo-aruamar-pdf.jpg (PDF, 240px)
│  ├─ prisma/
│  │  ├─ schema.prisma         modelos Hospede, Quarto, Reserva, Recibo
│  │  └─ seed.ts               cadastra as suítes (upsert, pode rodar várias vezes)
│  └─ src/
│     ├─ server.ts             sobe o servidor, aquece o Chromium, fecha recursos ao sair
│     ├─ app.ts                middlewares, rotas, login (/api), frontend estático, erros
│     ├─ config/pousada.ts     nome, CNPJ, endereço, PIX, telefone, e-mail, política de cancelamento
│     ├─ lib/prisma.ts         cliente do Prisma
│     ├─ middleware/           auth.middleware.ts (Basic Auth), error.middleware.ts
│     ├─ routes/               quarto, recibo, hospede (busca + estadia), operacao (painel, quartos, reservas)
│     ├─ controllers/          recibo.controller.ts (criar, PDF, PNG, cache de PDFs)
│     ├─ services/
│     │  ├─ recibo.service.ts  regras: upsert do hóspede, conflito de datas, numeração por tipo
│     │  ├─ pdf.service.ts     Chromium singleton, gerarPdf, gerarPng, aquecerPdf
│     │  ├─ lodgehog.service.ts integração com a API de reservas (somente leitura)
│     │  └─ operacao.service.ts regras do painel, status das suítes e reservas do período
│     ├─ schemas/recibo.schema.ts  validação zod + regras por tipo (superRefine)
│     ├─ templates/recibo.template.ts HTML do recibo e da pré-reserva (usado no PDF e no PNG)
│     └─ utils/               format (centavos, datas), validators (CPF/CNPJ), extenso,
│                             nomeArquivo, AppError
└─ frontend/
   ├─ public/logo-aruamar.jpg
   ├─ src/
   │  ├─ App.tsx              login, cabeçalho, abas (Início, Reservas, Quartos, Hóspedes e Emp., Recibos), Sair
   │  ├─ api.ts               cliente HTTP; login (localStorage), fetchAuth, PDF/PNG como blob
   │  ├─ types.ts             tipos do formulário e da API
   │  ├─ index.css            estilos base + efeito de clique nos botões
   │  └─ components/
   │     ├─ LoginPage.tsx     tela de entrada (estilo QuartoVerde)
   │     ├─ ReciboForm.tsx    formulário, ações pós-salvar, cópia para WhatsApp, impressão
   │     ├─ HospedeBusca.tsx  campo de busca na QuartoVerde
   │     ├─ InicioPainel.tsx   aba Início (resumo, chegadas, saídas)
   │     ├─ ReservasOperacao.tsx aba Reservas (calendário e lista)
   │     ├─ QuartosStatus.tsx aba Quartos
   │     ├─ HospedesEmp.tsx   aba Hóspedes e Emp. (busca e estadia)
   │     └─ DataNav.tsx       navegação de datas
   │  └─ utils/               money (máscaras, parse), whatsapp (wa.me/web), email (mailto), nomeArquivo
```

---

## 4. Modelo de dados (Prisma)

- **Hospede**: `id`, `tipo` (PF/PJ), `nome`, `documento` (CPF/CNPJ só dígitos, **opcional e único**),
  `ie`, `email`, `telefone`, `endereco`, `cidade`, `uf`, `cep`.
- **Quarto**: `id`, `numero` (único, ex. "101"), `nome` ("Suíte 101"), `capacidade`.
- **Reserva** (estadia): `id`, `status` (PRE_RESERVA, CONFIRMADA, CANCELADA), `checkin`, `checkout`,
  `adultos`, `criancas`, `diariaCentavos`, `totalCentavos`, `validadeAte` (opcional), `hospedeId`, `quartoId`.
- **Recibo**: documento emitido (RECIBO ou PRE_RESERVA), `numero` (sequência por tipo), valor em centavos,
  forma de pagamento, data, referente, observações. Valores são sempre inteiros em centavos.

Regras importantes:
- Dinheiro em centavos (inteiro). Conversão só nas bordas (`utils/format.ts`).
- Numeração independente para recibo e pré-reserva.
- Conflito de datas na mesma suíte bloqueia nova pré-reserva.
- Recibo exige CPF/CNPJ válido. Pré-reserva aceita sem documento.
- Nenhum recibo é editado depois de criado (não existe rota de edição). Isso permite cache de PDF.

---

## 5. Rotas da API

Todas em `/api`, exceto `/api/health`. Todas as rotas abaixo exigem login (Basic Auth), exceto health.

| Método | Rota | Função |
|---|---|---|
| GET | `/api/health` | verificação de saúde (sem login) |
| GET | `/api/quartos` | lista as suítes (usada também para validar o login) |
| POST | `/api/recibos` | cria recibo ou pré-reserva (201 + documento) |
| GET | `/api/recibos/:id/pdf` | PDF do documento (com nome do cliente; cache em memória) |
| GET | `/api/recibos/:id/imagem` | PNG do documento (para copiar no WhatsApp) |
| GET | `/api/hospedes?q=` | busca na QuartoVerde (mín. 3 caracteres) |
| GET | `/api/hospedes/:id/estadia` | reserva atual ou próxima: suíte, datas, adultos, diária, sinal |
| GET | `/api/reservas?data=AAAA-MM-DD` | reservas do dia: chegadas, hospedados, saídas |

---

## 6. Variáveis de ambiente

Arquivo `backend/.env` (local) e aba **Environment** do serviço no Render (produção).

| Variável | Para que serve | Observação |
|---|---|---|
| `DATABASE_URL` | caminho do SQLite | Render: `file:/data/aruamar.db` (já vem no Dockerfile) |
| `PORT` | porta | 3333 |
| `CORS_ORIGIN` | origens do frontend em dev | `http://localhost:5173` |
| `ADMIN_USER` | usuário de login | é o que aparece no campo "E-mail" da tela de login |
| `ADMIN_PASSWORD` | senha de login | **obrigatória em produção**; trocar se vazar |
| `LODGEHOG_API_KEY` | chave da QuartoVerde | **somente leitura**. Se faltar, a busca retorna 503 |
| `LODGEHOG_BASE_URL` | base da API | `https://api.lodgehog.com/v1` |
| `POUSADA_CNPJ`, `POUSADA_ENDERECO`, `PIX_CHAVE` | dados no PDF | opcionais (há valores padrão em `config/pousada.ts`) |

Nunca colocar chaves reais no código, no README ou no chat. Já houve chave colada em conversa;
a regra é revogar e gerar outra.

---

## 7. Deploy (Render) e armadilhas já resolvidas

Passo a passo resumido:
1. Subir o projeto no GitHub (repositório com `Dockerfile` na raiz).
2. Render > New > Web Service > conectar o repositório > Language **Docker** > região Oregon (não há Brasil).
3. Plano **Starter** (o Free não tem disco persistente). Em Disks, montar em `/data`, 1 GB.
4. Environment: adicionar as variáveis da seção 6. Salvar. Esperar o deploy ficar "Live".
5. Testar `https://<app>.onrender.com/api/health` (deve responder `{"ok":true}`).

Problemas que já aconteceram (não repetir):
- **`NODE_ENV=production` antes do `npm ci`** remove devDependencies (tsc, vite, prisma, tsx) e o build quebra
  com "exit code 127". Por isso o `NODE_ENV` só entra na etapa final do Dockerfile.
- **`prisma migrate deploy` sem pasta `migrations`** não cria tabelas. O projeto usa `prisma db push`.
  Se o projeto novo tiver migrações, usar `migrate deploy`; se não, `db push`.
- **Tipos do Prisma só existem após `prisma generate`.** Na máquina local sem internet para os binários
  do Prisma, o `tsc` mostra erros de `@prisma/client`; isso não acontece no Render.
- **Erro de TypeScript só aparece no Render** quando o tipo vindo do banco é `string` e a função espera
  um tipo fixo. Ao criar funções de texto, aceitar `string`.
- **Chromium no container**: usar `PUPPETEER_SKIP_DOWNLOAD=1`, `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
  e as flags `--no-sandbox --disable-dev-shm-usage --disable-gpu --no-zygote`.
- **Aquecer o Chromium na subida** (`aquecerPdf`) para o primeiro PDF não demorar.
- **Basic Auth no navegador** não aceita cabeçalho em links de nova aba. Por isso o PDF é baixado com
  o login e aberto como blob (`abrirPdf`, `baixarPdf`, `imprimirArquivo`).
- **Clipboard**: o navegador só copia texto e imagem. PDF não entra na área de transferência.
  A solução é copiar o PNG do documento e abrir o WhatsApp Web com o telefone.
- **WhatsApp Web**: abrir com `https://web.whatsapp.com/send?phone=...&text=...` e nome de janela fixo
  (`'whatsapp-web'`) para reaproveitar a aba. Não é possível anexar arquivo automaticamente.

---

## 8. Integração QuartoVerde (Lodgehog)

- Base: `https://api.lodgehog.com/v1`. Autenticação: `Authorization: Bearer <chave>`.
- Documentação em `https://api.lodgehog.com/v1/docs/` e schema OpenAPI (arquivo `Lodgehog_API.yaml`).
- Endpoints usados:
  - `GET /guests/` (parâmetros `q`, `identity_number`, `limit`)
  - `GET /reservations/` (parâmetros `guest`, `status` como `confirmed,checked_in`, `checkin_from`,
    `checkin_to`, `limit`). Campos usados: `checkin_date`, `checkout_date`, `adults`, `children`,
    `rooms[0].room.name`, `totals.total_price` (total da estadia), `totals.total_payments` (pago),
    `guest.name`, `guest.phone`, `booking_code`.
- Erros tratados: 401 chave inválida, 402 sem plano de API, 403 sem permissão de leitura, 429 limite.
- Limite padrão: 120 requisições por minuto.
- O endereço do hóspede vem como **uma string só**: a função `separarEndereco` separa
  endereço, cidade, UF e CEP por vírgulas e pelo formato (CEP 00000-000, UF com 2 letras).
- A integração é **somente leitura**. Nada é enviado para a QuartoVerde.

Campos da reserva que ainda não foram confirmados com dados reais: `status` exato de "Hospedado"
(usado `checked_in`) e de "Confirmada" (usado `confirmed`). Conferir com uma reserva real no primeiro teste.

---

## 9. O que é específico da Pousada Aruamar (trocar no projeto novo)

- Nome, CNPJ, endereço, telefone, e-mail e PIX: `backend/src/config/pousada.ts`.
- Logo: `backend/assets/logo-aruamar.jpg` (site e PDF usam versão menor) e `frontend/public/logo-aruamar.jpg`.
- Suítes: `backend/prisma/seed.ts` (10 suítes: 101–104 e 201–206). Trocar o array `SUITES`.
- Textos fixos: cabeçalho "Pousada Aruamar", "Recibos e pré-reservas" (`App.tsx`, `LoginPage.tsx`),
  texto de política de cancelamento e cláusula de sinal (`config/pousada.ts` e template).
- Cores: verde esmeralda (emerald-600) em todo o frontend. Trocar em Tailwind se a marca mudar.
- Lista "Referente a": `OPCOES_REFERENTE` em `ReciboForm.tsx` (Hospedagem, Consumo, Sinal de reserva, Diária extra).
- Formas de pagamento: `PAGAMENTOS` em `backend/src/types/index.ts` e `frontend/src/types.ts`.
- Frase de WhatsApp e e-mail: `ReciboForm.tsx` (funções `copiarImagem` e `enviarEmail`).

Para uma empresa que não é hotel, a integração com a QuartoVerde não se aplica: remover
`hospede.routes.ts` (estadia), `reserva.routes.ts` (reservas do dia), `lodgehog.service.ts` e as abas
correspondentes, e trocar por cadastro próprio de clientes e serviços.

---

## 10. Decisões de produto já tomadas (manter)

- Formulário com abas **Pré-reserva** e **Recibo**. Trocar de aba limpa a página.
- Depois de salvar: dados ficam na tela; botão "Salvo" desabilitado; botão "Nova pré-reserva" / "Novo recibo"
  no lugar da busca de hóspede.
- Painel pós-salvar com: Abrir PDF, Baixar PDF, Imprimir, Copiar para WhatsApp, Enviar PDF por e-mail.
- Painel e botões Limpar/Salvar ficam logo abaixo da busca de hóspede.
- Busca de hóspede aparece sempre que não há documento salvo.
- Sessão de login persistente até clicar em Sair.
- Diária preenchida com total ÷ noites (o recibo multiplica de volta pelas noites).
- Sinal preenchido com o total já pago na QuartoVerde.
- Nome do PDF: "Nome do Cliente - Recibo" / "Nome do Cliente - Pré-reserva".

---

## 11. Pendências e ideias não feitas

- Envio automático pelo WhatsApp (exige API oficial do WhatsApp Business, da Meta, com número verificado e custo por envio).
- Confirmação de pré-reserva (mudar `PRE_RESERVA` para `CONFIRMADA`) e cancelamento pela tela.
- Backup do arquivo SQLite (copiar `/data` periodicamente).
- Domínio próprio no Render.
- Login por usuário individual (hoje é um usuário só para a recepção).
- Gerar o PDF no momento de salvar, em vez de sob demanda, se a geração ficar lenta.

---

## 12. Como trabalhar com o assistente neste projeto

- Entregas em arquivo `.zip` completo do projeto (não trechos), para copiar e substituir.
- Antes de entregar: `tsc --noEmit` no frontend e no backend, e `vite build`.
- Ao mudar o schema do Prisma, lembrar que o deploy usa `db push` (colunas opcionais são seguras; colunas
  obrigatórias novas em tabelas com dados exigem valor padrão).
- Erros de build do Render: pedir o log completo do deploy (aba Logs).
- Não colar chaves de API, senhas ou dados de hóspedes no chat.
