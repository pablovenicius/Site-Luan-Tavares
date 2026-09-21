"use client";

import { useState, type FormEvent } from "react";
import { buildContactMessage, buildWhatsAppUrl, whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Reveal } from "@/components/ui/Reveal";

const modalidades = [
  { value: "Presencial", label: "Personal presencial" },
  { value: "Online", label: "Consultoria online" },
  { value: "Avaliação física", label: "Avaliação física" },
  { value: "Ainda não sei", label: "Ainda não sei" },
] as const;

export function Contato() {
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [modalidade, setModalidade] = useState<string>("Presencial");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro("Por favor, informe o seu nome.");
      setOk(false);
      return;
    }
    if (!objetivo.trim()) {
      setErro("Conte rapidamente qual é o seu objetivo.");
      setOk(false);
      return;
    }

    setErro("Tudo certo! Abrindo o WhatsApp…");
    setOk(true);

    const mensagem = buildContactMessage(nome.trim(), objetivo.trim(), modalidade);
    window.open(buildWhatsAppUrl(mensagem), "_blank", "noopener");
  }

  return (
    <Reveal>
      <section
        id="contato"
        className="relative overflow-hidden bg-[radial-gradient(900px_500px_at_50%_0%,rgba(95,227,27,.14),transparent_65%)]"
      >
        <div className="relative mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(310px,1fr))] items-start gap-[clamp(36px,5vw,60px)] px-5 py-[clamp(64px,8vw,120px)]">
          <div>
            <h2 className="mb-5 font-serif text-[clamp(32px,4.6vw,54px)] font-bold leading-[1.08] text-fg">
              Pronto para começar?
            </h2>
            <p className="mb-[30px] max-w-[48ch] text-pretty text-[clamp(16px,1.5vw,18px)] text-fg-muted">
              Se você quer começar a treinar, melhorar seu condicionamento ou alcançar um objetivo
              específico, entre em contato comigo. Vamos montar um planejamento de treino de acordo
              com o seu objetivo.
            </p>
            <WhatsAppButton href={whatsappLinks.geral} section="cta-final" size="lg">
              Chamar no WhatsApp
            </WhatsAppButton>
            <p className="mt-[18px] text-sm text-fg-subtle">
              Saiba mais sobre os planos de acompanhamento na conversa.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid gap-[18px] rounded-2xl border border-fg/10 bg-ink-card px-[26px] py-[30px]"
          >
            <p className="text-[13px] font-bold uppercase tracking-[.16em] text-lime">
              Prefere que eu te chame?
            </p>

            <div className="grid gap-2">
              <label htmlFor="lt-nome" className="text-sm font-semibold text-fg">
                Seu nome
              </label>
              <input
                id="lt-nome"
                name="nome"
                type="text"
                autoComplete="name"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErro("");
                }}
                aria-describedby="lt-erro"
                className="min-h-[48px] rounded-[10px] border border-fg/[.16] bg-ink px-3.5 text-base text-fg"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="lt-objetivo" className="text-sm font-semibold text-fg">
                Seu objetivo
              </label>
              <input
                id="lt-objetivo"
                name="objetivo"
                type="text"
                placeholder="Ex.: ganhar massa, emagrecer, voltar a treinar"
                value={objetivo}
                onChange={(e) => {
                  setObjetivo(e.target.value);
                  setErro("");
                }}
                aria-describedby="lt-erro"
                className="min-h-[48px] rounded-[10px] border border-fg/[.16] bg-ink px-3.5 text-base text-fg"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="lt-modalidade" className="text-sm font-semibold text-fg">
                Modalidade de interesse
              </label>
              <select
                id="lt-modalidade"
                name="modalidade"
                value={modalidade}
                onChange={(e) => setModalidade(e.target.value)}
                className="min-h-[48px] rounded-[10px] border border-fg/[.16] bg-ink px-3.5 text-base text-fg"
              >
                {modalidades.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <p
              id="lt-erro"
              role="status"
              aria-live="polite"
              className="min-h-[20px] text-sm font-semibold"
              style={{ color: ok ? "#A8FF1F" : "#FF6B6B" }}
            >
              {erro}
            </p>

            <button
              type="submit"
              className="min-h-[52px] rounded-[11px] bg-gradient-to-br from-lime to-lime-dark px-6 text-base font-extrabold text-onlime transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(95,227,27,.34)]"
            >
              Enviar pelo WhatsApp
            </button>
            <p className="text-[13px] text-fg-subtle">
              Ao enviar, o WhatsApp abre com a mensagem já preenchida. Nenhum dado é armazenado
              neste site.
            </p>
          </form>
        </div>
      </section>
    </Reveal>
  );
}
