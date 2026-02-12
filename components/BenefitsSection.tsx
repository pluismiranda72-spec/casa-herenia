"use client";

import { Zap, Snowflake, Wifi, Coffee, Tv } from "lucide-react";

const BENEFITS = [
  { id: "power", icon: Zap, title: "Energía de Respaldo 24H" },
  { id: "ac", icon: Snowflake, title: "Aire Acondicionado" },
  { id: "wifi", icon: Wifi, title: "Wifi Estable" },
  { id: "breakfast", icon: Coffee, title: "Desayuno Exquisito" },
  { id: "streaming", icon: Tv, title: "TV con Streaming" },
];

export default function BenefitsSection() {
  return (
    <section
      className="w-full py-12 md:py-24 px-4 md:px-6 bg-white"
      aria-labelledby="benefits-heading"
    >
      <div className="container mx-auto">
        <h2
          id="benefits-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-black text-center mb-8 md:mb-16"
        >
          Comodidades Exclusivas
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center gap-6 md:gap-10 max-w-5xl mx-auto">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center text-center min-w-0"
              >
                <div className="rounded-full bg-gray-50 p-3 md:p-4 flex items-center justify-center mb-3 md:mb-4">
                  <Icon
                    className="w-10 h-10 md:w-12 md:h-12 text-[#C5A059] shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <h3 className="font-sans text-sm sm:text-base md:text-lg font-medium text-gray-800">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
