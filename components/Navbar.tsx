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
  const tNav = useTranslations("Navigation");
  const tBrand = useTranslations("brand");
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) =>
    setScrolled(v > SCROLL_THRESHOLD)
  );

  const headerBg = scrolled
    ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C5A059]/30"
    : "bg-transparent border-b border-transparent";

  const ctaLabel = t("book");

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    // 1. Force CSS to stay out of the way
    document.documentElement.style.scrollBehavior = "auto";

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 3000; // Exactly 3 seconds
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;

      // LINEAR CALCULATION (No easing, no curves)
      // Progress is a direct percentage of time (0.0 to 1.0)
      const progress = Math.min(timeElapsed / duration, 1);

      // The math: Start + (Total Distance * Percentage)
      const run = startPosition + (distance * progress);

      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition);
        // Reset CSS behavior for other browser functions if necessary
        // document.documentElement.style.scrollBehavior = '';
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: ".header-booking-btn-force:hover { filter: brightness(90%) !important; }",
        }}
      />
      <header
        className={`fixed top-0 left-0 right-0 w-full z-[9999] transition-all duration-300 ${headerBg}`}
        role="banner"
      >
      <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between h-14 max-h-14 md:min-h-[60px] md:max-h-none gap-2 sm:gap-3">
        {/* Logo: más pequeño en móvil, sin otros enlaces de texto */}
        <Link
          href="/"
          className="font-serif text-[#C5A059] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target text-sm sm:text-base md:text-xl shrink-0 min-w-0 truncate max-w-[140px] sm:max-w-none"
          aria-label={`${tBrand("name")} - ${tNav("home")}`}
        >
          <span className="truncate">{tBrand("name")}</span>
        </Link>

        {/* Grupo de acción: Descubre Viñales + Preguntas frecuentes + Tu Reserva Segura + (Switcher + CTA) */}
        <div className="flex flex-row items-center gap-x-6 sm:gap-x-8 gap-y-0 shrink-0">
          <Link
            href="/descubre"
            className="hidden sm:inline font-sans text-sm font-semibold uppercase tracking-widest text-[#faf9f6]/90 hover:text-[#C5A059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 rounded"
          >
            {t("discoverCta")}
          </Link>
          <a
            href="#faq-section"
            onClick={(e) => handleSmoothScroll(e, "faq-section")}
            className="hidden sm:inline font-sans text-sm font-semibold uppercase tracking-widest text-[#faf9f6]/90 hover:text-[#C5A059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 rounded cursor-pointer"
          >
            {t("faqLink")}
          </a>
          <Link
            href="/reserva-segura"
            className="hidden sm:inline font-sans text-sm font-semibold uppercase tracking-widest text-[#faf9f6]/90 hover:text-[#C5A059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 rounded"
          >
            {t("safeBookingCta")}
          </Link>
          <div className="flex flex-row items-center gap-6">
            <LanguageSwitcher embedded />
            <Link
              href="/reservas"
              prefetch={true}
              className="header-booking-btn-force h-auto px-5 py-1.5 inline-flex items-center justify-center bg-[#C5A059] text-[#0A0A0A] text-xs sm:text-sm font-sans font-medium rounded-none focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] whitespace-nowrap"
              style={{ transition: "background-color 0.3s ease-in-out, filter 0.3s ease-in-out" }}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
