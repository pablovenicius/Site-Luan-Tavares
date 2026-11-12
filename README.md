# Luan Tavares – Personal Trainer

Landing page em **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.
Foco comercial: **consultoria online**, com o atendimento presencial em Aracaju como opção.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## O que editar

Tudo em **`src/config/site.ts`**: cidade, CREF, WhatsApp, Instagram, SEO e **fotos**.

| Campo | O que é |
| --- | --- |
| `url` | Domínio final (ou defina `NEXT_PUBLIC_SITE_URL` na hospedagem) — usado em SEO/Open Graph |
| `whatsapp` / `whatsappDisplay` | Número (55 + DDD + número) e como aparece escrito |
| `photos.hero` / `photos.sobre` | Foto vertical 4:5. Vazio = painel com a marca |
| `photos.galeria` | Lista `{ src, alt }`. A seção "Treino na prática" só aparece com fotos |

Fotos: salve em `public/images/` e informe o caminho (ex.: `"/images/hero-luan.jpg"`).
Toda foto ganha automaticamente revelação em cortina, parallax e zoom no hover.

## Estrutura

```
src/app            layout (fontes, SEO, JSON-LD), page, globals.css
src/config/site.ts dados do negócio e fotos
src/lib            whatsapp (links/mensagens), analytics, structured-data (FAQ), cn
src/components
  layout/          Header, Footer, WhatsAppDock (botão flutuante + barra mobile)
  sections/        Hero, Marquee, Sobre, Servicos, Metodo(+Timeline), Galeria, Faq, Contato
  ui/              Photo, Reveal, Spot, ScrollProgress, WhatsAppButton
public/images      logo-luan-tavares-hd.webp (4311×2187), og-image.jpg
public/            icon.png, apple-icon.png
```

Animações respeitam `prefers-reduced-motion`. Analytics (GA4/Meta Pixel) dispara
`whatsapp_click` se os scripts estiverem na página.
