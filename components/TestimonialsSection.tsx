"use client";

import { Link } from "@/i18n/navigation";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const TESTIMONIAL_KEYS = ["t1", "t2", "t3"] as const;

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="w-5 h-5 text-[#C5A059] fill-[#C5A059] shrink-0"
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations("Testimonials");

  return (
    <section
      className="w-full py-12 md:py-24 px-4 md:px-6 bg-[#0A0A0A]"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto">
        <h2
          id="testimonials-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl text-white text-center mb-8 md:mb-12"
        >
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {TESTIMONIAL_KEYS.map((key, index) => (
            <motion.article
              key={key}
              className="relative rounded-xl bg-white/5 backdrop-blur-md border border-[#C5A059]/30 p-5 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C5A059]/20 border border-[#C5A059]/40">
                <Check className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden />
                <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                  {t("verifiedStay")}
                </span>
              </div>

              <Stars count={5} />
              <blockquote className="mt-4 font-serif text-lg md:text-xl text-white/95 italic leading-relaxed">
                &ldquo;{t(`${key}.quote`)}&rdquo;
              </blockquote>
              <cite className="mt-6 not-italic block font-sans text-sm font-bold uppercase tracking-widest text-[#C5A059]">
                — {t(`${key}.author`)}
              </cite>
            </motion.article>
          ))}
        </div>

        {/* Tarjeta de Prestigio TripAdvisor */}
        <div className="flex justify-center my-8">
          <div className="w-full max-w-md border border-[#C5A059]/30 bg-white/5 rounded-lg py-4 px-8 flex flex-col items-center justify-center text-center gap-2">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]/70">
              TRIPADVISOR
            </p>
            <div className="flex items-center justify-center gap-2" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#C5A059] fill-[#C5A059] shrink-0" aria-hidden />
              ))}
              <span className="font-sans text-sm font-bold text-white ml-0.5">5.0</span>
            </div>
            <p
              className="font-serif text-lg md:text-xl text-white"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              N.º 1 de 62 hostales en Viñales
            </p>
            <p className="font-sans text-xs text-white/50">
              (285 opiniones)
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-16">
          <Link
            href="/opiniones"
            className="px-8 py-3 rounded-full border border-[#C5A059] text-[#C5A059] bg-transparent hover:bg-[#C5A059] hover:text-black transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase"
          >
            {t("ctaOpinions")}
          </Link>
          <a
            href="https://www.tripadvisor.es/Hotel_Review-g616288-d15045948-Reviews-Casa_Herenia_y_Pedro-Vinales_Pinar_del_Rio_Province_Cuba.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full border border-[#C5A059] text-[#C5A059] bg-transparent hover:bg-[#C5A059] hover:text-black transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase"
          >
            {t("ctaTripAdvisor")}
          </a>
        </div>
      </div>
    </section>
  );
}
