import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppDock } from "@/components/layout/WhatsAppDock";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Sobre } from "@/components/sections/Sobre";
import { Servicos } from "@/components/sections/Servicos";
import { Metodo } from "@/components/sections/Metodo";
import { Galeria } from "@/components/sections/Galeria";
import { Faq } from "@/components/sections/Faq";
import { Contato } from "@/components/sections/Contato";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Header />

      <main id="conteudo">
        <Hero />
        <Marquee />
        <Sobre />
        <Servicos />
        <Metodo />
        <Galeria />
        <Faq />
        <Contato />
      </main>

      <Footer />
      <WhatsAppDock />
    </>
  );
}
