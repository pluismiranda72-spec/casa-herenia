"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import { useTranslations } from "next-intl";
import TaxiBookingModal from "@/components/TaxiBookingModal";

export default function LocationSection() {
  const t = useTranslations("Location");
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);

  return (
    <section
      id="ubicacion"
      className="w-full !bg-gray-100 py-16"
      style={{ backgroundColor: "#f3f4f6" }}
      aria-labelledby="location-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
        <h2
          id="location-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center mb-8 md:mb-12"
        >
          {t("title")}
        </h2>
        <p className="font-serif text-lg text-gray-700 leading-relaxed mb-8">
          {t("subtitle")}
        </p>

        <div className="rounded-xl border border-[#C5A059]/30 bg-white p-6 md:p-8 shadow-sm text-left mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center">
              <Car className="w-5 h-5 text-[#C5A059]" aria-hidden />
            </div>
            <span className="font-sans font-semibold text-[#0A0A0A]">{t("transportTitle")}</span>
          </div>
          <ul className="space-y-2 font-sans text-sm text-gray-700 break-words min-w-0">
            <li><strong className="text-[#0A0A0A]">{t("taxiPrivate")}</strong></li>
            <li><strong className="text-[#0A0A0A]">{t("taxiColectivo")}</strong></li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setIsTaxiModalOpen(true)}
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans text-sm font-semibold hover:bg-[#C5A059]/90 transition-colors cursor-pointer"
        >
          {t("reserveTrip")}
        </button>
      </div>
      </div>

      <TaxiBookingModal
        key={isTaxiModalOpen ? "open" : "closed"}
        isOpen={isTaxiModalOpen}
        onClose={() => setIsTaxiModalOpen(false)}
      />
    </section>
  );
}
