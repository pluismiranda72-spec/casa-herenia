"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { DayPicker } from "react-day-picker";
import { es, enUS } from "date-fns/locale";
import { useBookingStore } from "@/stores/booking-store";
import { PROPERTIES } from "@/data/properties";
import { getNightlyPricing } from "@/utils/pricing";
import { createBooking } from "@/app/actions/createBooking";
import type { BlockedDatesByUnitYmd } from "@/lib/ical";
import CancellationPolicyModal from "@/components/CancellationPolicyModal";
import { isRedirectError } from "next/dist/client/components/redirect";
import "react-day-picker/style.css";

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateToKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nightsCount(from: Date | undefined, to: Date | undefined): number {
  if (!from || !to) return 0;
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export default function ReservasPage() {
  const {
    selectedUnit,
    range,
    guests,
    setSelectedUnit,
    setRange,
    setGuests,
  } = useBookingStore();
  const [blocked, setBlocked] = useState<BlockedDatesByUnitYmd>({
    room_1: [],
    room_2: [],
    full_villa: [],
  });

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => setBlocked(data))
      .catch(() => {});
  }, []);

  const blockedSet =
    selectedUnit != null ? new Set(blocked[selectedUnit]) : new Set<string>();
  const property = selectedUnit
    ? PROPERTIES.find((p) => p.unit === selectedUnit)
    : null;

  // Ajustar huéspedes al cambiar de unidad (p. ej. de villa a habitación)
  useEffect(() => {
    const prop = selectedUnit
      ? PROPERTIES.find((p) => p.unit === selectedUnit)
      : null;
    if (prop && guests > prop.maxGuests) setGuests(prop.maxGuests);
  }, [selectedUnit, guests, setGuests]);

  const nights = nightsCount(range.from, range.to);
  const pricing = property ? getNightlyPricing(property, guests) : null;
  const nightlyRate = pricing?.totalNightlyPrice ?? 0;
  const totalPrice = property ? nightlyRate * nights : 0;
  const hasExtraGuestSupplement =
    pricing && pricing.extraGuests > 0 && (property?.extraPersonFee ?? 0) > 0;

  const locale = useLocale();
  const t = useTranslations("Calendar");
  const tRooms = useTranslations("Rooms");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const dayPickerLocale = locale === "en" ? enUS : es;
  const [isPending, setIsPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setIsPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      await createBooking(null, formData);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setSubmitError(err instanceof Error ? err.message : tCommon("bookingError"));
    } finally {
      setIsPending(false);
    }
  };

  const canSubmit =
    selectedUnit &&
    range.from &&
    range.to &&
    nights > 0 &&
    totalPrice >= 0;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-brand-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl md:text-4xl text-white text-center mb-10">
          {t("reservasPageTitle")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-[#C5A059] mb-4">
                {t("selectRoom")}
              </h2>
              <div className="flex flex-wrap gap-3">
                {PROPERTIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedUnit(p.unit)}
                    className={`px-5 py-3 rounded-lg font-sans text-sm font-medium transition-colors border-2 touch-target ${
                      selectedUnit === p.unit
                        ? "bg-[#C5A059] border-[#C5A059] text-[#0A0A0A]"
                        : "border-white/30 text-white hover:border-[#C5A059]/50"
                    }`}
                  >
                    {tRooms(`${p.unit}.name`)}
                  </button>
                ))}
              </div>
            </section>

            {property && (
              <section>
                <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-[#C5A059] mb-4">
                  {t("guests")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setGuests(n)}
                        className={`min-h-[44px] min-w-[44px] rounded-lg font-sans text-sm font-medium transition-colors border-2 touch-target ${
                          guests === n
                            ? "bg-[#C5A059] border-[#C5A059] text-[#0A0A0A]"
                            : "border-white/30 text-white hover:border-[#C5A059]/50"
                        }`}
                      >
                        {n} {n === 1 ? t("adult") : t("adults")}
                      </button>
                    )
                  )}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-widest text-[#C5A059] mb-4">
                {t("dates")}
              </h2>
              <div className="bg-white/5 border border-[#C5A059]/30 rounded-xl p-4 md:p-6">
                <DayPicker
                  mode="range"
                  defaultMonth={new Date()}
                  selected={range}
                  onSelect={(r) => setRange(r ?? { from: undefined, to: undefined })}
                  disabled={(date) => blockedSet.has(dateToKey(date))}
                  locale={dayPickerLocale}
                  modifiersClassNames={{
                    selected: "!bg-[#C5A059] !text-[#0A0A0A]",
                    range_start: "!bg-[#C5A059] !text-[#0A0A0A]",
                    range_end: "!bg-[#C5A059] !text-[#0A0A0A]",
                    range_middle: "!bg-[#C5A059]/80 !text-[#0A0A0A]",
                    disabled: "!opacity-50 line-through",
                    today: "text-[#C5A059] font-semibold",
                  }}
                  className="text-white [--rdp-accent:#C5A059]"
                />
              </div>
            </section>
          </div>

          {/* Columna derecha: sticky resumen + formulario de contacto */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              method="post"
              className="lg:sticky lg:top-24 rounded-xl bg-white/5 border border-[#C5A059]/30 p-6 space-y-6"
            >
              <input type="hidden" name="locale" value={locale} />
              {canSubmit && (
                <>
                  <input type="hidden" name="room_id" value={selectedUnit ?? ""} />
                  <input
                    type="hidden"
                    name="check_in"
                    value={range.from ? formatYmd(range.from) : ""}
                  />
                  <input
                    type="hidden"
                    name="check_out"
                    value={range.to ? formatYmd(range.to) : ""}
                  />
                  <input type="hidden" name="guests_count" value={guests} />
                  <input type="hidden" name="total_price" value={totalPrice} />
                </>
              )}
              <h2 className="font-serif text-xl text-white">
                {t("reservationSummary")}
              </h2>
              {selectedUnit && property && (
                <>
                  <p className="font-sans text-sm text-gray-300">
                    <span className="text-[#C5A059]">{t("stay")}:</span>{" "}
                    {tRooms(`${property.unit}.name`)}
                  </p>
                  {range.from && (
                    <p className="font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("checkIn")}:</span>{" "}
                      {format.dateTime(range.from, { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  {range.to && (
                    <p className="font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("checkOut")}:</span>{" "}
                      {format.dateTime(range.to, { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  {nights > 0 && (
                    <p className="font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("nights")}:</span> {nights}
                    </p>
                  )}
                  {guests > 0 && (
                    <p className="font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("guestsCount")}:</span> {guests}
                    </p>
                  )}
                  <div className="border-t border-white/20 pt-4">
                    <p className="font-sans text-sm text-gray-400">
                      {nightlyRate}
                      {property.currency} {t("perNight", { nights })}
                    </p>
                    {hasExtraGuestSupplement && pricing && property.extraPersonFee != null && (
                      <p className="font-sans text-sm text-gray-300 mt-1">
                        {t("extraSupplementLine", { fee: property.extraPersonFee })}
                        <span className="block text-xs text-gray-400 mt-0.5">
                          ({pricing.extraGuests} × {property.extraPersonFee}
                          {property.currency}): +{pricing.nightlyExtraFee}
                          {property.currency}/noche
                        </span>
                      </p>
                    )}
                    <p className="font-serif text-2xl text-[#C5A059] mt-1">
                      {t("total")}: {totalPrice}
                      {property.currency}
                    </p>
                  </div>
                  <div className="space-y-3 border-t border-white/20 pt-4">
                    <label className="block font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("name")}</span>
                      <input
                        type="text"
                        name="guest_name"
                        required
                        placeholder={t("yourName")}
                        className="mt-1 w-full min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                      />
                    </label>
                    <label className="block font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("email")}</span>
                      <input
                        type="email"
                        name="guest_email"
                        required
                        placeholder={t("yourEmail")}
                        className="mt-1 w-full min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                      />
                    </label>
                    <label className="block font-sans text-sm text-gray-300">
                      <span className="text-[#C5A059]">{t("phone")}</span>
                      <input
                        type="tel"
                        name="guest_phone"
                        placeholder={t("optional")}
                        className="mt-1 w-full min-h-[44px] px-4 rounded-lg border border-[#C5A059]/30 bg-white/10 text-white placeholder:text-white/50 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
                      />
                    </label>
                  </div>
                </>
              )}
              {!selectedUnit && (
                <p className="font-sans text-sm text-gray-500">
                  {t("chooseStayAndDates")}
                </p>
              )}
              {submitError && (
                <p className="font-sans text-sm text-red-400" role="alert">
                  {submitError}
                </p>
              )}
              <button
                type="submit"
                disabled={!canSubmit || isPending}
                className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
              >
                {isPending ? t("redirectingStripe") : t("confirmBooking")}
              </button>
              <p className="mt-3 text-center">
                <CancellationPolicyModal />
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
