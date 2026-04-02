"use client";

import { useEffect, useState } from "react";
import { useLocale, useFormatter } from "next-intl";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { es, enUS } from "date-fns/locale";
import "react-day-picker/style.css";

function dateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReservaAmanecerClient() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [personas, setPersonas] = useState(1);
  const precioTotal = personas * 25;
  const [isLoading, setIsLoading] = useState(false);
  const [amanecerBlockedDates, setAmanecerBlockedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/tours/amanecer/availability")
      .then((res) => res.json())
      .then((data: { blocked?: string[] }) => {
        setAmanecerBlockedDates(new Set(data.blocked ?? []));
      })
      .catch(() => {
        setAmanecerBlockedDates(new Set());
      });
  }, []);

  const locale = useLocale();
  const format = useFormatter();
  const dayPickerLocale = locale === "en" ? enUS : es;

  const fecha = range?.from ? dateToKey(range.from) : "";

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/checkout-amanecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          precioTotal,
          personas,
          fecha,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error("Error devuelto por la API:", data);
        alert("Hubo un problema al procesar el pago. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl px-4">
      <h1
        className="font-serif text-3xl md:text-4xl text-[#0A0A0A] text-center mb-8"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Disponibilidad: Amanecer en Los Acuáticos
      </h1>
      <div
        className="hidden md:flex flex-row items-center justify-center gap-3 mt-3 mb-8 text-sm font-sans text-gray-700"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        <span className="font-semibold text-gray-900">Tu reserva incluye:</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="text-sky-500 font-bold text-lg leading-none">•</span> Transporte
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-sky-500 font-bold text-lg leading-none">•</span> Agua embotellada
          </span>
        </span>
      </div>

      <section className="mb-6">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-[#C5A059] mb-4">
          {locale === "en" ? "Dates" : "Fechas"}
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
          <DayPicker
            mode="range"
            defaultMonth={new Date()}
            selected={range}
            onSelect={(r) => setRange(r ?? { from: undefined, to: undefined })}
            disabled={(date) => amanecerBlockedDates.has(dateToKey(date))}
            locale={dayPickerLocale}
            modifiersClassNames={{
              selected: "!bg-[#C5A059] !text-[#0A0A0A]",
              range_start: "!bg-[#C5A059] !text-[#0A0A0A]",
              range_end: "!bg-[#C5A059] !text-[#0A0A0A]",
              range_middle: "!bg-[#C5A059]/80 !text-[#0A0A0A]",
              disabled: "!opacity-50 line-through",
              today: "text-[#C5A059] font-semibold",
            }}
            className="text-[#0A0A0A] [--rdp-accent:#C5A059] mx-auto"
          />

          <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 mb-2 border-t border-gray-100 pt-6">
            <label className="text-sm font-sans text-gray-700">
              {locale === "en" ? "Guests" : "Personas"}
              <select
                className="mt-1 block w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-sky-400 outline-none"
                value={personas}
                onChange={(e) => setPersonas(Number(e.target.value))}
                aria-label={locale === "en" ? "Number of guests" : "Número de personas"}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm font-sans text-gray-600">
              {locale === "en" ? "Total" : "Total"}:{" "}
              <span className="text-lg font-bold text-[#0A0A0A]">{precioTotal} €</span>
              <span className="text-gray-500 text-xs ml-1">(25 € / {locale === "en" ? "person" : "persona"})</span>
            </p>
          </div>

          <div className="hidden md:flex w-full justify-end mt-8 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hidden md:flex cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Procesando..." : "Confirmar Reserva"}
            </button>
          </div>
        </div>
      </section>

      {range?.from && (
        <p className="font-sans text-center text-sm text-[#0A0A0A]/80">
          {range.to
            ? `${format.dateTime(range.from, { dateStyle: "medium" })} — ${format.dateTime(range.to, { dateStyle: "medium" })}`
            : format.dateTime(range.from, { dateStyle: "medium" })}
        </p>
      )}
    </div>
  );
}
