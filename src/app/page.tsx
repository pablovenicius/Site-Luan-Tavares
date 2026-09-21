import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { MobileStickyBar } from "@/components/layout/MobileStickyBar";
import { Hero } from "@/components/sections/Hero";
import { ParaQuem } from "@/components/sections/ParaQuem";
import { Especialidades } from "@/components/sections/Especialidades";
import { Servicos } from "@/components/sections/Servicos";
import { Metodo } from "@/components/sections/Metodo";
import { Diferencial } from "@/components/sections/Diferencial";
import { Alunos } from "@/components/sections/Alunos";
import { Faq } from "@/components/sections/Faq";
import { Contato } from "@/components/sections/Contato";

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="conteudo">
        <Hero />
        <ParaQuem />
        <Especialidades />
        <Servicos />
        <Metodo />
        <Diferencial />
        <Alunos />
        <Faq />
        <Contato />
      </main>

      <Footer />

      <MobileStickyBar />
      <FloatingWhatsApp />
    </>
  );
}
