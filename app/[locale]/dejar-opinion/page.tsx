"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import {
  submitReview,
  type SubmitReviewState,
} from "@/app/actions/submitReview";

type Props = {
  params: { locale: string };
};

export default function DejarOpinionPage(_props: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitReviewState | null>(null);

  const effectiveRating = hovered || rating;
  const submittedOk = result?.success === true;
  const errorMessage =
    result && !result.success ? result.error ?? "No se pudo enviar tu opinión." : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name.trim() || !comment.trim() || rating < 1) {
      setResult({
        success: false,
        error: "Por favor, indica tu nombre, una opinión y una valoración de estrellas.",
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    // Esta página no está vinculada a una reserva concreta, así que usamos un UUID
    // neutro como booking_id solo para satisfacer el esquema. Debe ajustarse si
    // más adelante se enlaza con reservas reales.
    formData.set("booking_id", crypto.randomUUID());
    formData.set("author_name", name.trim());
    formData.set("rating", String(rating));
    formData.set("title", "");
    const composedComment = country.trim()
      ? `País: ${country.trim()}\n\n${comment.trim()}`
      : comment.trim();
    formData.set("comment", composedComment);

    let next: SubmitReviewState;
    try {
      next = await submitReview(null, formData);
    } catch {
      next = {
        success: false,
        error: "No se pudo enviar tu opinión. Inténtalo de nuevo más tarde.",
      };
    }
    setResult(next);
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/40">
        {submittedOk ? (
          <div className="space-y-3 text-center">
            <h1 className="text-xl font-semibold">
              ¡Gracias por tu reseña!
            </h1>
            <p className="text-sm text-slate-300">
              Tu opinión nos ayuda a seguir mejorando y da confianza a otros
              viajeros que están pensando en reservar en Casa Herenia y Pedro.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <header className="space-y-3 text-center">
              <h1 className="text-xl font-semibold">
                ¡Evalúa tu estancia en Casa Herenia y Pedro!
              </h1>
              <p className="text-xs text-slate-300">
                Solo te llevará un minuto y nos ayudas muchísimo a mejorar.
              </p>
            </header>

            {/* Selector de estrellas */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-300">Tu valoración general</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= effectiveRating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHovered(value)}
                      onMouseLeave={() => setHovered(0)}
                      className="p-1"
                      aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  País
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ej. España, México, Alemania..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  Opinión
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué te ha gustado más de tu estancia..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 text-center">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center rounded-xl bg-amber-500 text-slate-950 px-4 py-2.5 text-sm font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Publicando tu opinión..." : "Publicar mi opinión"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

