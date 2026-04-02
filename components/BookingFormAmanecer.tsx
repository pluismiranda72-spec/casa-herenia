"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

export default function BookingFormAmanecer() {
  const [personas, setPersonas] = useState(1);
  const precioTotal = personas * 25;

  return (
    <section
      id="calendario-amanecer"
      className="flex flex-col md:hidden items-center justify-center py-16 bg-gray-50 border-t border-gray-200 mt-12"
    >
      <div className="container mx-auto px-4 w-full flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl w-full flex flex-row gap-8 items-center">
          <div className="flex-1 min-w-0">
            <h2
              className="font-serif text-2xl md:text-3xl text-[#0A0A0A] mb-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Selecciona tu fecha para el Amanecer
            </h2>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none cursor-pointer"
              aria-label="Fecha"
            />
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-sky-400 outline-none cursor-pointer"
              value={personas}
              onChange={(e) => setPersonas(Number(e.target.value))}
              aria-label="Número de personas"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="flex justify-between items-center py-2 px-1 mb-2 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Precio total:</span>
              <span className="text-2xl font-bold text-[#0A0A0A]">{precioTotal} €</span>
            </div>
            <Link
              href="/reserva-amanecer"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center text-center"
            >
              Verificar Disponibilidad
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
