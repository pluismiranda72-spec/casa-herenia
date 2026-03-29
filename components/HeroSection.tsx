"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Divide la descripción en 4 bloques de palabras; saltos solo en móvil (md+ el texto fluye con espacios). */
function HeroDescription({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return <>{text}</>;
  }
  if (words.length < 4) {
    return <>{text}</>;
  }

  const q1 = Math.ceil(words.length / 4);
  const q2 = Math.ceil((words.length * 2) / 4);
  const q3 = Math.ceil((words.length * 3) / 4);

  const line1 = words.slice(0, q1).join(" ");
  const line2 = words.slice(q1, q2).join(" ");
  const line3 = words.slice(q2, q3).join(" ");
  const line4 = words.slice(q3).join(" ");

  return (
    <>
      {line1}{" "}
      <br className="block md:hidden" />
      {line2}{" "}
      <br className="block md:hidden" />
      {line3}{" "}
      <br className="block md:hidden" />
      {line4}
    </>
  );
}

export default function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative w-full h-[80vh] md:h-screen overflow-hidden bg-gray-900">
      {/* 1. La Imagen de Fondo (Ruta exacta corregida) */}
      <img
        src="/images/hero-habitacion.jpeg"
        alt="Habitación principal con vista al Valle de Viñales"
        className="absolute inset-0 w-full h-full object-cover z-0"
        loading="eager"
      />

      {/* 2. Superposición Oscura (Overlay) para LEGIBILIDAD */}
      <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true" />

      {/* 3. Contenedor de Texto y Botones (Mantiene el diseño UI centrado) */}
      <div className="relative z-20 container mx-auto flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-8 text-center text-white sm:px-6 sm:py-16 md:px-8">
        <div className="w-full max-w-2xl space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl"
          >
            {t("title")} <br />
            <span className="text-[#C5A059]">{t("brand")}</span>
          </motion.h1>

          <div className="mx-auto max-w-2xl md:max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="px-2 text-center font-sans text-base font-light leading-snug text-gray-200"
            >
              <HeroDescription text={t("description")} />
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6"
        >
          <Link
            href="/reservas"
            prefetch={true}
            className="inline-block w-full border-2 border-white bg-transparent px-6 py-3 text-center font-sans text-sm font-semibold tracking-widest text-white transition-all duration-300 ease-in-out hover:border-[#6A8D55] hover:bg-[#6A8D55] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            {t("cta")}
          </Link>
          <Link
            href="/descubre"
            className="inline-block w-full shrink-0 border border-[#C5A059] px-4 py-2.5 text-center font-sans text-xs uppercase tracking-widest text-[#C5A059] transition-colors hover:bg-[#C5A059] hover:text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-transparent sm:w-auto sm:px-6 sm:py-3 md:hidden"
          >
            {t("discoverCta")}
          </Link>
          <Link
            href="/reserva-segura"
            className="inline-block w-full shrink-0 border border-[#C5A059] px-4 py-2.5 text-center font-sans text-xs uppercase tracking-widest text-[#C5A059] transition-colors hover:bg-[#C5A059] hover:text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-transparent sm:w-auto sm:px-6 sm:py-3 md:hidden"
          >
            {t("safeBookingCta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
