"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 1. Imagen de Fondo (Placeholder de Lujo) */}
      <div className="absolute inset-0">
        <Image
          src="/fondo.jpg"
          alt="Vista panorámica de Casa Herenia y Pedro"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Overlay Oscuro para que se lea el texto */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* 2. Contenido Central */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 sm:px-6 md:px-8 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight"
        >
          {t("title")} <br />
          <span className="text-[#C5A059]">{t("brand")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-sans text-base sm:text-lg md:text-xl max-w-2xl mb-8 md:mb-10 text-gray-200 font-light px-2 text-center"
        >
          {t("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 md:mt-10"
        >
          <Link
            href="/reservas"
            className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-none font-sans font-semibold tracking-widest hover:bg-[#6A8D55] hover:border-[#6A8D55] transition-all duration-300 ease-in-out text-sm sm:text-base inline-block text-center"
          >
            {t("cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
