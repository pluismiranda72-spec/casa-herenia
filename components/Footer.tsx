"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("Footer");

  return (
    <footer className="w-full bg-[#0A0A0A] text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div>
            <Link
              href={`/${locale}`}
              className="font-serif text-xl md:text-2xl text-[#C5A059] hover:opacity-90 transition-opacity"
            >
              {t("brandName")}
            </Link>
            <p className="mt-3 font-sans text-sm text-white/60 max-w-xs">
              {t("tagline")}
            </p>
            <Link
              href={`/${locale}/nosotros`}
              className="mt-4 block font-sans text-sm text-white/60 no-underline hover:text-[#C5A059] transition-colors"
            >
              {t("ourStory")}
            </Link>
          </div>

          <div>
            <h3 className="font-sans font-semibold text-white text-sm uppercase tracking-widest mb-4">
              {t("quickLinks")}
            </h3>
            <nav className="flex flex-col gap-3" aria-label="Enlaces del sitio">
              <Link
                href={`/${locale}`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                {t("home")}
              </Link>
              <Link
                href={`/${locale}#estancias`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                {t("rooms")}
              </Link>
              <Link
                href={`/${locale}/reservas`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                {t("book")}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-sans font-semibold text-white text-sm uppercase tracking-widest mb-4">
              {t("contact")}
            </h3>
            <p className="font-sans text-sm text-white/70 mb-4">
              {t("questions")}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:pluismiranda72@gmail.com"
                className="inline-flex items-center gap-2 font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" aria-hidden />
                pluismiranda72@gmail.com
              </a>
              <a
                href="https://wa.me/34624070468"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden />
                +34 624 070 468
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-white/50">
              © {new Date().getFullYear()} {t("brandName")}. {t("rights")}
            </p>
            <div className="flex gap-6">
              <Link
                href={`/${locale}/aviso-legal`}
                className="font-sans text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                {t("legal")}
              </Link>
              <Link
                href={`/${locale}/privacidad`}
                className="font-sans text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                {t("privacy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
