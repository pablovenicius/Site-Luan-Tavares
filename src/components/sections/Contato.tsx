"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { buildContactMessage, buildWhatsAppUrl, whatsappLinks } from "@/lib/whatsapp";
import { IconInstagram, IconWhatsApp } from "@/components/icons";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const modalidades = ["Consultoria online", "Personal presencial (Aracaju)", "Avaliação física", "Ainda não sei"];

const campo =
  "min-h-[52px] w-full rounded-xl border border-white/[.14] bg-ink px-4 text-base text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-lime";

export function Contato() {
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [modalidade, setModalidade] = useState(modalidades[0] ?? "");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nome.trim()) return (setOk(false), setErro("Por favor, informe o seu nome."));
    if (!objetivo.trim()) return (setOk(false), setErro("Conte rapidamente qual é o seu objetivo."));

    setOk(true);
    setErro("Tudo certo! Abrindo o WhatsApp…");
    window.open(
      buildWhatsAppUrl(buildContactMessage(nome.trim(), objetivo.trim(), modalidade)),
      "_blank",
      "noopener"
    );
  }

  return (
    <section
      id="contato"
      className="relative isolate overflow-hidden bg-[radial-gradient(900px_520px_at_50%_0%,rgba(168,255,31,.13),transparent_65%)]"
    >
      <div className="mx-auto grid max-w-[1240px] items-start gap-16 px-5 py-[clamp(80px,10vw,150px)] lg:grid-cols-[1fr_1fr] lg:gap-24">
        <Reveal>
          <h2 className="mb-6 font-serif text-[clamp(40px,6vw,84px)] font-bold leading-[1.02] text-fg">
            Pronto para <span className="italic text-lime">começar?</span>
          </h2>
          <p className="mb-10 max-w-[46ch] text-lg leading-relaxed text-fg-muted">
            Me conta seu objetivo e montamos um planejamento de treino sob medida, online ou presencial
            em Aracaju. A resposta vem direto no WhatsApp.
          </p>

          <WhatsAppButton href={whatsappLinks.online} section="cta-final" size="lg" arrow>
            Chamar no WhatsApp
          </WhatsAppButton>

          <ul className="mt-12 grid gap-4 text-[15px]">
            <li className="flex items-center gap-3 text-fg-muted">
              <IconWhatsApp className="h-5 w-5 text-lime" />
              {siteConfig.whatsappDisplay}
            </li>
            <li>
              <a
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 text-fg-muted transition-colors hover:text-lime"
              >
                <IconInstagram className="h-5 w-5 text-lime" />@{siteConfig.instagram}
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={150}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid gap-5 rounded-3xl border border-white/10 bg-ink-card/80 p-7 backdrop-blur-xl sm:p-9"
          >
            <p className="text-xs font-bold uppercase tracking-[.22em] text-lime">
              Prefere que eu te chame?
            </p>

            <label className="grid gap-2 text-sm font-semibold text-fg">
              Seu nome
              <input
                name="nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => (setNome(e.target.value), setErro(""))}
                className={campo}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-fg">
              Seu objetivo
              <input
                name="objetivo"
                placeholder="Ex.: ganhar massa, emagrecer, voltar a treinar"
                value={objetivo}
                onChange={(e) => (setObjetivo(e.target.value), setErro(""))}
                className={campo}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-fg">
              Modalidade de interesse
              <select
                name="modalidade"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className={campo}
              >
                {modalidades.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <p
              role="status"
              aria-live="polite"
              className={`min-h-[20px] text-sm font-semibold ${ok ? "text-lime" : "text-danger"}`}
            >
              {erro}
            </p>

            <button
              type="submit"
              className="min-h-[56px] rounded-full bg-lime px-8 text-base font-bold text-onlime shadow-[0_10px_34px_-8px_rgba(168,255,31,.55)] transition-all hover:-translate-y-0.5 hover:bg-lime-soft"
            >
              Enviar pelo WhatsApp
            </button>
            <p className="text-[13px] text-fg-faint">
              O WhatsApp abre com a mensagem pronta. Nenhum dado é armazenado neste site.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
