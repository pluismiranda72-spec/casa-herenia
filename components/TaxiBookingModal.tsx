"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { X, CreditCard, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { bookTaxi } from "@/app/actions/bookTaxi";

const PRICE_COLECTIVO = 25;
const PRICE_PRIVADO_PER_VEHICLE = 120;
const MAX_PRIVADO_PAX = 6;

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Taxi");
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-wait"
    >
      {pending ? t("sending") : t("submit")}
    </button>
  );
}

type TaxiBookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TaxiBookingModal({ isOpen, onClose }: TaxiBookingModalProps) {
  const t = useTranslations("Taxi");
  const formRef = useRef<HTMLFormElement>(null);
  const bookingTypeRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useFormState(bookTaxi, null);
  const [serviceType, setServiceType] = useState<"colectivo" | "privado">("colectivo");
  const [passengers, setPassengers] = useState(1);

  const maxPassengers = serviceType === "privado" ? MAX_PRIVADO_PAX : 8;
  const effectivePassengers = passengers < 1 ? 1 : Math.min(maxPassengers, passengers);
  const totalPrice =
    serviceType === "privado"
      ? effectivePassengers <= 4
        ? PRICE_PRIVADO_PER_VEHICLE
        : PRICE_PRIVADO_PER_VEHICLE * 2
      : effectivePassengers * PRICE_COLECTIVO;
  const showMultiTaxiInfo = serviceType === "privado" && effectivePassengers > 4;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Solo cap cuando cambia el tipo y el valor actual supera el nuevo máximo (ej: 8 en colectivo → usuario cambia a privado → 6).
  useEffect(() => {
    if (passengers <= maxPassengers) return;
    setPassengers(maxPassengers);
  }, [serviceType, maxPassengers, passengers]);

  // onChange: solo actualizar estado; no restringir máximo aquí para permitir escritura fluida (ej: "2", "3").
  function handlePassengersChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      setPassengers(0);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    setPassengers(parsed);
  }

  // Validación solo al salir del campo: aplicar mínimo y máximo.
  function handlePassengersBlur() {
    if (passengers < 1) setPassengers(1);
    else if (passengers > maxPassengers) setPassengers(maxPassengers);
  }

  function handlePayment() {
    const form = formRef.current;
    if (!form) return;
    const name = (form.elements.namedItem("client_name") as HTMLInputElement)?.value?.trim();
    const whatsapp = (form.elements.namedItem("client_whatsapp") as HTMLInputElement)?.value?.trim();
    const address = (form.elements.namedItem("pickup_address") as HTMLInputElement)?.value?.trim();
    const date = (form.elements.namedItem("pickup_date") as HTMLInputElement)?.value?.trim();
    if (!name || !whatsapp || !address || !date) {
      alert(t("fillAllFields"));
      return;
    }
    if (bookingTypeRef.current) bookingTypeRef.current.value = "pago";
    form.requestSubmit();
  }

  if (!isOpen) return null;

  const success = state?.success === true;
  const isPagoSuccess = state && state.success && state.type === "pago";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="absolute inset-0 z-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-[#0A0A0A] border border-[#C5A059]/30 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0A0A]/95 z-10">
          <h2 className="font-serif text-xl text-white">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t("close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <p className="font-sans text-lg text-[#C5A059]">
                {isPagoSuccess ? t("redirecting") : t("successSent")}
              </p>
              {!isPagoSuccess && (
                <>
                  <p className="font-sans text-sm text-white/70">
                    {t("successContact")}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 transition-colors cursor-pointer"
                  >
                    {t("closeBtn")}
                  </button>
                </>
              )}
              {isPagoSuccess && (
                <p className="font-sans text-sm text-white/60">
                  {t("redirectHint")}
                </p>
              )}
            </div>
          ) : (
            <form ref={formRef} action={formAction} className="space-y-5">
              <input
                type="hidden"
                name="booking_type"
                ref={bookingTypeRef}
                defaultValue="solicitud"
              />
              <label className="block">
                <span className="font-sans text-sm text-[#C5A059] mb-1 block">{t("nameLabel")}</span>
                <input
                  type="text"
                  name="client_name"
                  required
                  placeholder={t("namePlaceholder")}
                  className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
              </label>
              <label className="block">
                <span className="font-sans text-sm text-[#C5A059] mb-1 block">{t("whatsappLabel")}</span>
                <input
                  type="tel"
                  name="client_whatsapp"
                  required
                  placeholder={t("whatsappPlaceholder")}
                  className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
              </label>
              <label className="block">
                <span className="font-sans text-sm text-[#C5A059] mb-1 block">{t("addressLabel")}</span>
                <input
                  type="text"
                  name="pickup_address"
                  required
                  placeholder={t("addressPlaceholder")}
                  className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
              </label>
              <label className="block">
                <span className="font-sans text-sm text-[#C5A059] mb-1 block">{t("dateLabel")}</span>
                <input
                  type="date"
                  name="pickup_date"
                  required
                  className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
              </label>

              <fieldset>
                <span className="font-sans text-sm text-[#C5A059] mb-2 block">{t("serviceTypeLabel")}</span>
                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="service_type"
                      value="colectivo"
                      checked={serviceType === "colectivo"}
                      onChange={() => setServiceType("colectivo")}
                      className="sr-only"
                    />
                    <span
                      className={`block py-3 px-4 rounded-lg border-2 text-center font-sans text-sm transition-colors ${
                        serviceType === "colectivo"
                          ? "border-[#C5A059] bg-[#C5A059]/10 text-white"
                          : "border-white/20 text-white/80 hover:border-white/40"
                      }`}
                    >
                      {t("colectivo")}
                    </span>
                    <span className="block mt-1 font-sans text-xs text-white/50 text-center">{t("colectivoPrice")}</span>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="service_type"
                      value="privado"
                      checked={serviceType === "privado"}
                      onChange={() => setServiceType("privado")}
                      className="sr-only"
                    />
                    <span
                      className={`block py-3 px-4 rounded-lg border-2 text-center font-sans text-sm transition-colors ${
                        serviceType === "privado"
                          ? "border-[#C5A059] bg-[#C5A059]/10 text-white"
                          : "border-white/20 text-white/80 hover:border-white/40"
                      }`}
                    >
                      {t("privado")}
                    </span>
                    <span className="block mt-1 font-sans text-xs text-white/50 text-center">{t("privadoPrice")}</span>
                  </label>
                </div>
              </fieldset>

              <label className="block">
                <span className="font-sans text-sm text-[#C5A059] mb-1 block">{t("passengersLabel")}</span>
                <input type="hidden" name="passengers_count" value={effectivePassengers} />
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={t("passengersLabel")}
                  min={1}
                  max={maxPassengers}
                  value={passengers === 0 ? "" : passengers}
                  onFocus={(e) => e.target.select()}
                  onChange={handlePassengersChange}
                  onBlur={handlePassengersBlur}
                  className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white font-sans text-base focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                />
                <span className="font-sans text-xs text-white/50 mt-1 block">
                  {serviceType === "privado" ? t("passengersHintPrivado") : t("passengersHintColectivo")}
                </span>
              </label>

              <div className="rounded-lg bg-white/5 border border-[#C5A059]/30 px-4 py-3">
                <p className="font-sans text-sm text-white/70">{t("totalLabel")}</p>
                <p className="font-serif text-2xl text-[#C5A059]">{totalPrice} EUR o USD</p>
              </div>

              {showMultiTaxiInfo && (
                <div className="flex gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-4 py-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden />
                  <p className="font-sans text-sm text-amber-200/95">
                    {t("multiTaxiInfo")}
                  </p>
                </div>
              )}

              {state && !state.success && (
                <p className="font-sans text-sm text-red-400" role="alert">
                  {state.error}
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePayment}
                  className="w-full min-h-[48px] rounded-lg bg-green-700 hover:bg-green-800 text-white font-sans font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5 shrink-0" aria-hidden />
                  {t("confirmPayment")}
                </button>
                <SubmitButton />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
