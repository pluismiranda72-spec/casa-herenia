"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import TaxiBookingModal from "@/components/TaxiBookingModal";

export default function LocationSection() {
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);

  return (
    <section
      id="ubicacion"
      className="w-full bg-gray-50 py-12 md:py-20 px-4 md:px-6"
      aria-labelledby="location-heading"
    >
      <div className="container mx-auto max-w-2xl text-center">
        <h2
          id="location-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#0A0A0A] mb-4"
        >
          Llegada sin Preocupaciones
        </h2>
        <p className="font-serif text-lg text-gray-700 leading-relaxed mb-8">
          Te recogemos en la puerta de tu alojamiento hasta nuestra casa.
        </p>

        <div className="rounded-xl border border-[#C5A059]/30 bg-white p-6 md:p-8 shadow-sm text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center">
              <Car className="w-5 h-5 text-[#C5A059]" aria-hidden />
            </div>
            <span className="font-sans font-semibold text-[#0A0A0A]">Opciones de transporte</span>
          </div>
          <ul className="space-y-2 font-sans text-sm text-gray-700">
            <li>
              <strong className="text-[#0A0A0A]">Taxi Privado:</strong> 120 EUR o USD (total por vehículo, máx. 4 pax)
            </li>
            <li>
              <strong className="text-[#0A0A0A]">Taxi Colectivo:</strong> 25 EUR o USD por persona
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setIsTaxiModalOpen(true)}
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans text-sm font-semibold hover:bg-[#C5A059]/90 transition-colors cursor-pointer"
        >
          Reservar viaje
        </button>
      </div>

      <TaxiBookingModal
        key={isTaxiModalOpen ? "open" : "closed"}
        isOpen={isTaxiModalOpen}
        onClose={() => setIsTaxiModalOpen(false)}
      />
    </section>
  );
}
