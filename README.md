# Luan Tavares – Personal Trainer

Landing page convertida do HTML original (exportado da ferramenta de Design)
para **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## O que editar antes de publicar

Quase todo o conteúdo dinâmico do site está centralizado em
**`src/config/site.ts`**. Troque os placeholders entre colchetes pelos
dados reais do Luan:

| Campo            | O que é                                              |
| ----------------- | ----------------------------------------------------- |
| `city`            | Cidade de atendimento presencial ([CIDADE])            |
| `neighborhoods`   | Bairros/regiões atendidos                              |
| `whatsapp`        | Número com DDI 55 + DDD + número, só dígitos (ex.: `"5579999999999"`) |
| `instagram`       | Usuário do Instagram (sem @)                           |
| `cref`            | Número do CREF                                         |
| `url`             | Domínio final de produção (usado em SEO/Open Graph)     |

O campo `whatsapp` alimenta automaticamente todos os links de WhatsApp do
site (`src/lib/whatsapp.ts`), inclusive as mensagens pré-preenchidas de
cada seção e o formulário de contato.

O texto "Atendimento presencial em [CIDADE] e região ([BAIRROS/REGIÕES])"
e o texto de rodapé com `[WHATSAPP]` ainda têm placeholders literais em
`src/components/layout/Footer.tsx` e `src/lib/structured-data.ts` (última
pergunta do FAQ) — ajuste-os junto com `site.ts`.

## Fotos do Luan

O HTML original tinha dois "slots" de foto vazios (hero e seção "Sobre")
que nunca foram preenchidos com uma imagem real — por isso eles viraram o
componente `src/components/ui/ImagePlaceholder.tsx` nesta conversão.

Para colocar as fotos reais:

1. Salve os arquivos em `public/images/` (ex.: `hero-luan.jpg`, `sobre-luan.jpg`).
2. Em `src/components/sections/Hero.tsx`, troque `<ImagePlaceholder ... />`
   por:

   ```tsx
   import Image from "next/image";

   <Image
     src="/images/hero-luan.jpg"
     alt="Luan Tavares treinando"
     fill
     className="object-cover"
   />;
   ```

   (mantendo o container com `position: relative` que já envolve o
   placeholder).

O logo (`logo-luan-tavares.png`, com fundo transparente de verdade — canal
alfa, não é truque de CSS) já está em `public/images/` e em uso no
header, hero e rodapé.

## Estrutura do projeto

```
src/
  app/
    layout.tsx      → fontes (Playfair Display + Plus Jakarta Sans), metadata/SEO, JSON-LD
    page.tsx         → composição das seções da home
    globals.css       → Tailwind + estilos base
  config/
    site.ts          → dados do negócio (cidade, WhatsApp, Instagram, CREF...)
  lib/
    whatsapp.ts       → geração dos links wa.me e mensagens por seção
    analytics.ts       → tracking de cliques no WhatsApp (GA4 / Meta Pixel)
    structured-data.ts → JSON-LD (ProfessionalService, Person, FAQPage) e itens do FAQ
    cn.ts             → helper de concatenação de classes
  components/
    icons.tsx          → ícones SVG usados nas seções
    layout/            → Header, Footer, FloatingWhatsApp, MobileStickyBar
    sections/           → Hero, ParaQuem, Especialidades, Servicos, Metodo,
                          Diferencial, Alunos, Faq, Contato
    ui/                 → WhatsAppButton, Reveal (scroll reveal), ImagePlaceholder
```

## Analytics (GA4 / Meta Pixel)

`src/lib/analytics.ts` dispara `gtag('event', 'whatsapp_click', ...)` e
`fbq('trackCustom', 'WhatsAppClick', ...)` sempre que alguém clica em um
CTA de WhatsApp — exatamente como no HTML original — mas só se o GA4/Pixel
já estiverem carregados na página (nenhum dos dois vem incluído aqui; some
o script de cada um no `layout.tsx` quando for usar).

## Breakpoint mobile/desktop

O layout original alternava entre navegação/menu mobile e o botão
flutuante de WhatsApp com base na largura real da janela (900px, medida em
JavaScript). Nesta conversão isso foi substituído pelo breakpoint `md`
(768px) do Tailwind, resolvido via CSS puro — mais simples e sem
JavaScript extra. Ajuste em `tailwind.config.ts` caso queira mudar o ponto
de corte.

## Deploy

Projeto pronto para Vercel ou Netlify (build padrão do Next.js):

```bash
npm run build
```
