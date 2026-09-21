import { whatsappLinks } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function MobileStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-fg/[.1] bg-ink-deep/[.94] px-3.5 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md md:hidden">
      <WhatsAppButton
        href={whatsappLinks.geral}
        section="barra-mobile"
        size="lg"
        className="flex w-full"
      >
        Chamar no WhatsApp
      </WhatsAppButton>
    </div>
  );
}
