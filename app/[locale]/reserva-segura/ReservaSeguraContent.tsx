"use client";

import { Link } from "@/i18n/navigation";
import {
  Shield,
  CreditCard,
  CheckCircle,
  User,
  Award,
  Heart,
} from "lucide-react";
import { reservaSeguraContent } from "@/lib/constants/bookingContent";

const ICON_MAP = {
  Shield,
  CreditCard,
  CheckCircle,
  User,
  Award,
  Heart,
} as const;

export default function ReservaSeguraContent() {
  const c = reservaSeguraContent;

  return (
    <article className="min-h-screen bg-[#faf9f6] text-[#0A0A0A]">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Encabezado */}
          <header className="text-center mb-12 md:mb-16">
            <h1
              className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#0A0A0A] mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {c.title}
            </h1>
            <p
              className="font-serif text-xl text-[#C5A059] italic"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {c.subtitle}
            </p>
          </header>

          <p className="font-sans text-lg text-[#0A0A0A]/85 leading-relaxed mb-10">
            {c.intro}
          </p>

          {/* Bloques de contenido */}
          {c.sections.map((section, i) => (
            <section key={i} className="mb-10">
              <h2
                className="font-serif text-xl md:text-2xl text-[#0A0A0A] mb-3"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {section.heading}
              </h2>
              <p className="font-sans text-[#0A0A0A]/80 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}

          {/* 6 puntos de confianza */}
          <section className="my-12 md:my-16">
            <h2
              className="font-serif text-2xl md:text-3xl text-[#0A0A0A] mb-8 text-center"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Por qué reservar con nosotros
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {c.trustPoints.map((point, i) => {
                const Icon = ICON_MAP[point.icon];
                return (
                  <li
                    key={i}
                    className="flex gap-4 p-4 rounded-lg bg-white/60 border border-[#C5A059]/20"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center">
                      {Icon && <Icon className="w-5 h-5 text-[#C5A059]" aria-hidden />}
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-[#0A0A0A] mb-1">
                        {point.title}
                      </h3>
                      <p className="font-sans text-sm text-[#0A0A0A]/75">
                        {point.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Logos de confianza (placeholders) */}
          <section className="flex flex-wrap items-center justify-center gap-8 py-8 border-t border-b border-[#C5A059]/20 my-12">
            <div className="flex items-center gap-2 text-[#0A0A0A]/70">
              <div className="w-24 h-8 bg-[#0A0A0A]/10 rounded flex items-center justify-center font-sans text-xs font-bold">
                Stripe
              </div>
              <span className="font-sans text-xs text-[#0A0A0A]/60">Pago seguro</span>
            </div>
            <div className="flex items-center gap-2 text-[#0A0A0A]/70">
              <div className="w-24 h-8 bg-[#0A0A0A]/10 rounded flex items-center justify-center font-sans text-xs font-bold">
                TripAdvisor
              </div>
              <span className="font-sans text-xs text-[#0A0A0A]/60">Opiniones verificadas</span>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mt-12">
            <h2
              className="font-serif text-xl md:text-2xl text-[#0A0A0A] mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {c.ctaTitle}
            </h2>
            <p className="font-sans text-[#0A0A0A]/70 mb-6">{c.ctaSubtext}</p>
            <Link
              href="/reservas"
              className="inline-block bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold px-8 py-3 rounded-none tracking-widest hover:bg-[#C5A059]/90 transition-colors text-sm uppercase"
            >
              Ir a reservar
            </Link>
          </section>
        </div>
      </div>
    </article>
  );
}
