"use client";

import { ChevronDown } from "lucide-react";

export const faqData = [
  {
    question: "¿Cómo funciona el pago y necesito llevar mucho efectivo?",
    answer:
      "Al reservar online con nosotros, pagas el alojamiento de forma 100% segura mediante pasarela europea. Solo necesitarás efectivo para gastos menores locales. Olvídate del estrés de viajar con grandes sumas de dinero.",
  },
  {
    question: "¿Tendré conexión a Internet en la casa?",
    answer:
      "Sí. Sabemos lo importante que es estar conectado. Contamos con una red WiFi estable y energía de respaldo 24H para que puedas comunicarte con tu familia o trabajar, sin depender de las redes públicas.",
  },
  {
    question: "¿Cómo llego a Viñales desde La Habana u otro lugar del país?",
    answer:
      "Nos encargamos de todo. Gestionamos traslados seguros; desde La Habana en taxi privado (120€) para cuatro personas o colectivo (25€) por persona, directo hasta nuestra puerta.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq-section"
      className="w-full bg-[#0A0A0A]/95 border-t border-[#C5A059]/20 py-16 px-4"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          id="faq-heading"
          className="font-serif text-xl md:text-2xl text-white mb-8"
        >
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-gray-700/80">
          {faqData.map((item, index) => (
            <details
              key={index}
              className="group border-b border-gray-700/80 last:border-b-0"
            >
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 py-4 text-left transition-colors duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]">
                <span className="font-sans text-lg font-medium text-white pr-4 select-none">
                  {item.question}
                </span>
                <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#C5A059]/20 text-[#C5A059] transition-transform duration-300 group-open:rotate-180">
                  <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </summary>
              <div className="pb-4 pr-12">
                <p className="font-sans text-base text-gray-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
