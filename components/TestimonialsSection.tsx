"use client";

import { Link } from "@/i18n/navigation";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "Encontré una paz que no sabía que necesitaba. El servicio fue impecable y cada detalle estaba pensado para que nos sintiéramos como en casa. Volveremos sin duda.",
    author: "Sophie Laurent",
    rating: 5,
  },
  {
    id: "2",
    quote:
      "La combinación de naturaleza y confort es única. Dormir con el sonido del bosque y desayunar con esas vistas… Una experiencia que nos ha reconectado como familia.",
    author: "Marco Benedetti",
    rating: 5,
  },
  {
    id: "3",
    quote:
      "Trato exquisito y un lugar que transmite calma desde el primer momento. El equipo se preocupó por cada pequeño detalle. Recomiendo Casa Herenia y Pedro con el corazón.",
    author: "Elena Kowalski",
    rating: 5,
  },
];

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
          Lo que dicen nuestros huéspedes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {TESTIMONIALS.map((review, index) => (
            <motion.article
              key={review.id}
              className="relative rounded-xl bg-white/5 backdrop-blur-md border border-[#C5A059]/30 p-5 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Badge VERIFIED STAY */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C5A059]/20 border border-[#C5A059]/40">
                <Check className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden />
                <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                  Verified Stay
                </span>
              </div>

              <Stars count={review.rating} />
              <blockquote className="mt-4 font-serif text-lg md:text-xl text-white/95 italic leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <cite className="mt-6 not-italic block font-sans text-sm font-bold uppercase tracking-widest text-[#C5A059]">
                — {review.author}
              </cite>
            </motion.article>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-16">
          <Link
            href="/opiniones"
            className="px-8 py-3 rounded-full border border-[#C5A059] text-[#C5A059] bg-transparent hover:bg-[#C5A059] hover:text-black transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase"
          >
            VER OPINIONES DE LA CASA
          </Link>
          <a
            href="https://www.tripadvisor.es/Hotel_Review-g616288-d15045948-Reviews-Casa_Herenia_y_Pedro-Vinales_Pinar_del_Rio_Province_Cuba.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full border border-[#C5A059] text-[#C5A059] bg-transparent hover:bg-[#C5A059] hover:text-black transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase"
          >
            LEER EN TRIPADVISOR
          </a>
        </div>
      </div>
    </section>
  );
}
