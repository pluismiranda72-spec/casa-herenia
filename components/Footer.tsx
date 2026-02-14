"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const locale = useLocale();

  return (
    <footer className="w-full bg-[#0A0A0A] text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Col 1: Logo */}
          <div>
            <Link
              href={`/${locale}`}
              className="font-serif text-xl md:text-2xl text-[#C5A059] hover:opacity-90 transition-opacity"
            >
              Casa Herenia y Pedro
            </Link>
            <p className="mt-3 font-sans text-sm text-white/60 max-w-xs">
              Lujo tranquilo en el corazón de la naturaleza.
            </p>
            <Link
              href={`/${locale}/nosotros`}
              className="mt-4 block font-sans text-sm text-white/60 no-underline hover:text-[#C5A059] transition-colors"
            >
              Nuestra Historia
            </Link>
          </div>

          {/* Col 2: Enlaces rápidos */}
          <div>
            <h3 className="font-sans font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Enlaces rápidos
            </h3>
            <nav className="flex flex-col gap-3" aria-label="Enlaces del sitio">
              <Link
                href={`/${locale}`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                Inicio
              </Link>
              <Link
                href={`/${locale}#estancias`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                Habitaciones
              </Link>
              <Link
                href={`/${locale}/reservar`}
                className="font-sans text-sm text-white/80 hover:text-[#C5A059] transition-colors"
              >
                Reservar
              </Link>
            </nav>
          </div>

          {/* Col 3: Contacto directo */}
          <div>
            <h3 className="font-sans font-semibold text-white text-sm uppercase tracking-widest mb-4">
              Contacto
            </h3>
            <p className="font-sans text-sm text-white/70 mb-4">
              ¿Preguntas? Escríbenos cuando quieras.
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

        {/* Línea y pie */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-white/50">
              © {new Date().getFullYear()} Casa Herenia y Pedro. Todos los
              derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href={`/${locale}/aviso-legal`}
                className="font-sans text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                Aviso legal
              </Link>
              <Link
                href={`/${locale}/privacidad`}
                className="font-sans text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
