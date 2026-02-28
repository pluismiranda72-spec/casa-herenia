"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = [
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
    question: "¿Cómo llego a Viñales desde el aeropuerto o La Habana?",
    answer:
      "Nos encargamos de todo. Gestionamos traslados seguros en taxi privado (120€) o colectivo (25€) directo hasta nuestra puerta. Sin regateos ni sorpresas, con conductores de nuestra absoluta confianza.",
  },
] as const;

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full">
      <h2 className="font-serif text-xl md:text-2xl text-white mb-6">
        Preguntas frecuentes
      </h2>
      <div className="divide-y divide-gray-700/80">
        {faqData.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border-b border-gray-700/80 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left transition-all duration-300 hover:opacity-90"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span className="font-sans text-lg font-medium text-white pr-4">
                  {item.question}
                </span>
                <span
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#C5A059]/20 text-[#C5A059] transition-all duration-300"
                  aria-hidden
                >
                  {isOpen ? (
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className="grid transition-all duration-300 ease-out"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                }}
              >
                <div className="overflow-hidden">
                  <p className="font-sans text-base text-gray-400 pb-4 pr-12 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
