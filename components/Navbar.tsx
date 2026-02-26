"use client";

import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLocale, useTranslations } from "next-intl";

const SCROLL_THRESHOLD = 24;

export function Navbar() {
  const { scrollY } = useScroll();
  const locale = useLocale();
  const t = useTranslations("Hero");
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) =>
    setScrolled(v > SCROLL_THRESHOLD)
  );

  const headerBg = scrolled
    ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C5A059]/30"
    : "bg-transparent border-b border-transparent";

  const ctaLabel = locale === "en" ? "BOOK" : "RESERVAR";

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300 ${headerBg}`}
      role="banner"
    >
      <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between h-14 max-h-14 md:min-h-[60px] md:max-h-none gap-2 sm:gap-3">
        {/* Logo: más pequeño en móvil, sin otros enlaces de texto */}
        <Link
          href="/"
          className="font-serif text-[#C5A059] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target text-sm sm:text-base md:text-xl shrink-0 min-w-0 truncate max-w-[140px] sm:max-w-none"
          aria-label="Casa Herenia y Pedro - Inicio"
        >
          <span className="truncate">Casa Herenia y Pedro</span>
        </Link>

        {/* Grupo de acción: Descubre Viñales + Tu Reserva Segura + Selector de Idioma + CTA Reservar */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <Link
            href="/descubre"
            className="hidden sm:inline font-sans text-sm font-semibold uppercase tracking-widest text-[#faf9f6]/90 hover:text-[#C5A059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 rounded"
          >
            {t("discoverCta")}
          </Link>
          <Link
            href="/reserva-segura"
            className="hidden sm:inline font-sans text-sm font-semibold uppercase tracking-widest text-[#faf9f6]/90 hover:text-[#C5A059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 rounded"
          >
            {t("safeBookingCta")}
          </Link>
          <LanguageSwitcher embedded />
          <Link
            href="/reservas"
            className="bg-[#C5A059] text-[#0A0A0A] text-xs sm:text-sm font-sans font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-none hover:bg-[#C5A059]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target whitespace-nowrap"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
