"use client";

import { useEffect, useRef, useState } from "react";

type Modo = "desktop" | "mobile";

const VIDEOS: Record<Modo, string> = {
  desktop: "/videos/hero-desktop.mp4",
  mobile: "/videos/hero-mobile.mp4",
};

/**
 * Vídeo de fundo da primeira tela (Luan treinando com alunos, em loop e sem áudio).
 * - Mostra primeiro a imagem de capa (carrega rápido e serve de reserva).
 * - Não carrega o vídeo com "reduzir movimento" ou economia de dados.
 * - Pausa quando a primeira tela sai da vista, para poupar bateria.
 * Arquivos em public/videos: hero-desktop.mp4/.jpg e hero-mobile.mp4/.jpg
 */
export function HeroVideo() {
  const [modo, setModo] = useState<Modo | null>(null);
  const [rodando, setRodando] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduzir || conexao?.saveData) return;
    setModo(window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !modo) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [modo]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-30 overflow-hidden bg-ink">
      {/* Imagem de capa (também é o que aparece sem vídeo) */}
      <div className="absolute inset-0 bg-[url('/videos/hero-mobile.jpg')] bg-cover bg-center md:hidden" />
      <div className="absolute inset-0 hidden bg-[url('/videos/hero-desktop.jpg')] bg-cover bg-center md:block" />

      {modo && (
        <video
          key={modo}
          ref={ref}
          src={VIDEOS[modo]}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          onPlaying={() => setRodando(true)}
          onError={() => setRodando(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            rodando ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
