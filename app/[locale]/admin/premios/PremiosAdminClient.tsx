"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, ImageIcon, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  listAwards,
  createAward,
  deleteAward,
  type AwardAdminRow,
} from "@/app/actions/premiosAdmin";

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastList({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`rounded-lg border px-4 py-3 shadow-lg font-sans text-sm ${
            t.type === "success"
              ? "border-green-500/50 bg-green-950/90 text-green-100"
              : "border-red-500/50 bg-red-950/90 text-red-100"
          }`}
        >
          {t.message}
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

type Props = {
  initialAwards: AwardAdminRow[];
};

export default function PremiosAdminClient({ initialAwards }: Props) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [awards, setAwards] = useState<AwardAdminRow[]>(initialAwards);
  const [pending, setPending] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    setToastId((prev) => {
      const id = prev + 1;
      setToasts((prevToasts) => [...prevToasts, { id, type, message }]);
      setTimeout(
        () =>
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id)),
        4000
      );
      return id;
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    const data = await listAwards();
    setAwards(data);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedYear = Number(year);
    if (!title.trim() || !imageUrl.trim() || !parsedYear) {
      addToast("error", "Rellena título, año y URL de la imagen.");
      return;
    }
    setPending(true);
    const result = await createAward({
      title: title.trim(),
      year: parsedYear,
      imageUrl: imageUrl.trim(),
    });
    setPending(false);
    if (result.success) {
      addToast("success", "Premio creado correctamente.");
      setTitle("");
      setYear("");
      setImageUrl("");
      await refresh();
    } else {
      addToast("error", result.error);
    }
  };

  const handleDelete = async (id: string) => {
    setPending(true);
    const result = await deleteAward(id);
    setPending(false);
    if (result.success) {
      addToast("success", "Premio eliminado.");
      await refresh();
    } else {
      addToast("error", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" aria-hidden />
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                Gestión de Premios
              </h1>
              <p className="text-xs text-slate-400">
                Controla los galardones que se muestran en la web.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Sección superior: formulario */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40">
          <h2 className="text-base md:text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" aria-hidden />
            Añadir nuevo premio
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Título del premio
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Superhost, Traveller Review Awards..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Año
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={new Date().getFullYear().toString()}
                  min={2000}
                  max={2100}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                URL de la imagen
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="flex-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (Cloudinary u otra CDN)"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ImageIcon className="w-4 h-4" aria-hidden />
                  Usa la URL de la imagen ya subida (Cloudinary / panel de fotos).
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-slate-900 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "Guardando..." : "Guardar premio"}
            </button>
          </form>
        </section>

        {/* Sección inferior: galería / lista de premios */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40">
          <h2 className="text-base md:text-lg font-semibold text-amber-400 mb-4">
            Premios actuales
          </h2>

          {awards.length === 0 ? (
            <p className="text-sm text-slate-400">
              Todavía no hay premios configurados. Añade el primero con el
              formulario superior.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="group rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-32 bg-slate-900/60">
                    {award.image_url ? (
                      <Image
                        src={award.image_url}
                        alt={award.title ?? award.image_url}
                        fill
                        sizes="(max-width: 768px) 150px, 200px"
                        className="object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">
                        {award.title || "Sin título"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {award.year ?? "Sin año"} · Posición {award.position}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(award.id)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/60 bg-transparent px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}

