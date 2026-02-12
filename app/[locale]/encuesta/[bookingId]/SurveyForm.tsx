"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useFormState } from "react-dom";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/submitReview";

const CATEGORIES = [
  { key: "Limpieza", label: "Limpieza" },
  { key: "Servicio", label: "Servicio" },
  { key: "Ubicación", label: "Ubicación" },
  { key: "Confort", label: "Confort" },
] as const;

type SurveyFormProps = { bookingId: string; defaultAuthorName: string };

export default function SurveyForm({ bookingId, defaultAuthorName }: SurveyFormProps) {
  const [state, formAction] = useFormState(submitReview, null);
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categories, setCategories] = useState<Record<string, number>>({
    Limpieza: 5,
    Servicio: 5,
    Ubicación: 5,
    Confort: 5,
  });

  useEffect(() => {
    if (state?.success) router.push("/?thanks=review");
  }, [state, router]);

  const displayRating = hoverRating || rating;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <input type="hidden" name="categories" value={JSON.stringify(categories)} />

      <label className="block">
        <span className="font-sans text-sm text-[#C5A059] mb-2 block">Nombre (como desea aparecer) *</span>
        <input
          type="text"
          name="author_name"
          required
          defaultValue={defaultAuthorName}
          placeholder="Su nombre"
          className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        />
      </label>

      <div>
        <span className="font-sans text-sm text-[#C5A059] mb-3 block">Valoración general *</span>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] touch-target"
              style={{
                borderColor: displayRating >= value ? "#C5A059" : "rgba(255,255,255,0.3)",
                backgroundColor: displayRating >= value ? "rgba(197, 160, 89, 0.2)" : "transparent",
              }}
              aria-label={`${value} de 5`}
            >
              <Star
                className={`w-6 h-6 ${
                  displayRating >= value ? "text-[#C5A059] fill-[#C5A059]" : "text-white/30"
                }`}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="font-sans text-sm text-[#C5A059] mb-3 block">Subcategorías</span>
        <div className="space-y-4">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="font-sans text-sm text-white/80 w-24 shrink-0">{label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setCategories((prev) => ({ ...prev, [key]: value }))
                    }
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-1 focus:ring-offset-[#0A0A0A]"
                    aria-label={`${label}: ${value}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        (categories[key] ?? 0) >= value
                          ? "text-[#C5A059] fill-[#C5A059]"
                          : "text-white/20"
                      }`}
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="font-sans text-sm text-[#C5A059] mb-1 block">Título de la opinión (opcional)</span>
        <input
          type="text"
          name="title"
          maxLength={200}
          placeholder="Ej: Una semana maravillosa"
          className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        />
      </label>

      <label className="block">
        <span className="font-sans text-sm text-[#C5A059] mb-1 block">Tu experiencia (opcional)</span>
        <textarea
          name="comment"
          rows={5}
          maxLength={3000}
          placeholder="Cuéntenos sobre su estancia..."
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 resize-y min-h-[120px]"
        />
      </label>

      {state && !state.success && (
        <p className="font-sans text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!rating}
        className="w-full min-h-[52px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Publicar opinión
      </button>
    </form>
  );
}
