"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 año

function setLocaleCookie(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

type Locale = "es" | "en";

type LanguageSwitcherProps = { embedded?: boolean };

export function LanguageSwitcher({ embedded }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setLocaleCookie(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div
      className={`flex items-center gap-1 font-sans text-sm tracking-wide ${
        embedded ? "relative" : "fixed top-6 right-6 z-[1000]"
      }`}
      role="group"
      aria-label="Selección de idioma"
    >
      <button
        type="button"
        onClick={() => handleSwitch("es")}
        className={`transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target ${
          locale === "es"
            ? "font-semibold text-[#C5A059]"
            : "text-white/60 hover:text-white/80"
        }`}
        aria-current={locale === "es" ? "true" : undefined}
      >
        ES
      </button>
      <span className="text-white/40 select-none" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => handleSwitch("en")}
        className={`transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target ${
          locale === "en"
            ? "font-semibold text-[#C5A059]"
            : "text-white/60 hover:text-white/80"
        }`}
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </div>
  );
}
