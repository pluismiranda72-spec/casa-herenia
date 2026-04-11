"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();

  return (
    <section className="relative w-full h-[80vh] md:h-screen overflow-hidden bg-gray-900">
      {/* 1. La Imagen de Fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Nueva.webp"
          alt="Habitación principal con vista al Valle de Viñales"
          fill
          className="object-cover"
          priority={true}
          sizes="100vw"
          quality={100}
          unoptimized={true}
        />
      </div>

      {/* 2. Superposición Oscura (Overlay) para LEGIBILIDAD */}
      <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true" />

      {/* 3. Contenedor de Texto y Botones */}
      <div className="relative z-20 container mx-auto flex h-full min-h-0 flex-col items-center justify-center overflow-y-auto px-4 py-8 text-center text-white sm:px-6 sm:py-16 md:px-8">
        <div className="w-full max-w-2xl md:max-w-5xl space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl"
          >
            {t("title")} <br />
            <span className="text-[#C5A059]">{t("brand")}</span>
          </motion.h1>

          <div className="w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              {locale === "es" ? (
                <p className="block md:hidden text-center w-full px-2 text-[0.9rem] tracking-tight leading-snug mx-auto text-white">
                  <span className="whitespace-nowrap">
                    Una de las mejores Casas Particulares.
                  </span>
                  <br />
                  Atención personalizada, Confort
                  <br />
                  y Reserva Segura en Viñales.
                </p>
              ) : (
                <p className="block md:hidden text-center w-full px-2 text-[0.9rem] tracking-tight leading-snug mx-auto text-white">
                  <span className="whitespace-nowrap">
                    One of the best Casas Particulares.
                  </span>
                  <br />
                  Personalized attention, comfort
                  <br />
                  and secure booking in Viñales.
                </p>
              )}
              <p
                className="hidden md:block text-center w-full mx-auto px-4 md:max-w-xl lg:max-w-2xl md:text-[1.1rem] lg:text-[1.25rem] md:leading-snug font-sans font-light text-white"
              >
                {locale === "es" ? (
                  <>
                    Una de las mejores Casas Particulares en Viñales <br />
                    Atención Personalizada, Confort y Reserva Segura
                  </>
                ) : (
                  <>
                    One of the best Casas Particulares in Viñales <br />
                    Personalized Attention, Comfort, and Secure Booking
                  </>
                )}
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6"
        >
          {/* BOTÓN RESERVAR AHORA: Ajustado otros 5mm (total 34px) hacia abajo en móvil */}
          <Link
            href="/reservas"
            prefetch={true}
            className="relative translate-y-[34px] md:translate-y-0 max-md:w-fit max-md:mx-auto max-md:block max-md:border max-md:border-white/90 max-md:px-3 max-md:py-1 max-md:rounded-md inline-block w-full bg-transparent text-center font-sans text-sm font-semibold tracking-widest text-white transition-all duration-300 ease-in-out md:border-2 md:border-white md:hover:border-[#6A8D55] md:hover:bg-[#6A8D55] sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            {t("cta")}
          </Link>
          
          <Link
            href="/descubre"
            className="hidden md:hidden w-full shrink-0 border border-transparent bg-transparent px-4 py-2.5 text-center font-sans text-xs uppercase tracking-widest text-[#C5A059] transition-colors hover:bg-transparent hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-transparent sm:w-auto sm:px-6 sm:py-3"
          >
            {t("discoverCta")}
          </Link>
          
          <Link
            href="/reserva-segura"
            className="hidden md:hidden w-full shrink-0 border border-transparent bg-transparent px-4 py-2.5 text-center font-sans text-xs uppercase tracking-widest text-[#C5A059] transition-colors md:border md:border-[#C5A059] md:hover:bg-[#C5A059] md:hover:text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 focus:ring-offset-2 focus:ring-offset-transparent sm:w-auto sm:px-6 sm:py-3"
          >
            {t("safeBookingCta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}