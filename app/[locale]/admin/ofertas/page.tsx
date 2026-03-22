"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type MensajeFeedback =
  | { tipo: "success"; texto: string }
  | { tipo: "error"; texto: string }
  | null;

/** Límite recomendado para la píldora del hero en la página pública (evita textos largos; la UI usa ellipsis como respaldo). */
const OFERTA_TITULO_MAX_CHARS = 80;

export default function AdminOfertasPage() {
  const supabase = useMemo(() => createClient(), []);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tituloEn, setTituloEn] = useState("");
  const [descripcionEn, setDescripcionEn] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [mensaje, setMensaje] = useState<MensajeFeedback>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargandoInicial(true);
      setMensaje(null);

      const { data, error } = await supabase
        .from("oferta_especial")
        .select("titulo, descripcion, titulo_en, descripcion_en")
        .eq("id", 1)
        .maybeSingle();

      if (cancelado) return;

      if (error) {
        setMensaje({
          tipo: "error",
          texto: error.message || "No se pudo cargar la oferta.",
        });
        setTitulo("");
        setDescripcion("");
        setTituloEn("");
        setDescripcionEn("");
        setCargandoInicial(false);
        return;
      }

      if (data) {
        setTitulo(data.titulo ?? "");
        setDescripcion(data.descripcion ?? "");
        setTituloEn(data.titulo_en ?? "");
        setDescripcionEn(data.descripcion_en ?? "");
      } else {
        setTitulo("");
        setDescripcion("");
        setTituloEn("");
        setDescripcionEn("");
        setMensaje({
          tipo: "error",
          texto:
            "No hay fila con id = 1 en oferta_especial. Créala en Supabase antes de editar.",
        });
      }

      setCargandoInicial(false);
    }

    void cargar();

    return () => {
      cancelado = true;
    };
  }, [supabase]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje(null);
    setIsLoading(true);

    const { error } = await supabase
      .from("oferta_especial")
      .update({
        titulo,
        descripcion,
        titulo_en: tituloEn,
        descripcion_en: descripcionEn,
      })
      .eq("id", 1);

    setIsLoading(false);

    if (error) {
      setMensaje({
        tipo: "error",
        texto: error.message || "Error al guardar. Revisa permisos (RLS) y datos.",
      });
      return;
    }

    setMensaje({
      tipo: "success",
      texto: "Cambios guardados correctamente.",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <header className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-slate-900 md:text-3xl">
            Panel de Administración: Oferta Especial
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Edita el título y la descripción en español e inglés que se muestran en
            la página pública de la oferta. El título del hero es una píldora de una
            línea: máximo {OFERTA_TITULO_MAX_CHARS} caracteres por idioma. Los cambios
            se guardan en Supabase (tabla{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              oferta_especial
            </code>
            , fila <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">id = 1</code>
            ).
          </p>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="space-y-4">
            <h2 className="border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Español
            </h2>
            <div>
              <label
                htmlFor="oferta-titulo"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Título{" "}
                <span className="font-normal text-slate-500">
                  (máx. {OFERTA_TITULO_MAX_CHARS} caracteres, píldora en el hero)
                </span>
              </label>
              <input
                id="oferta-titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={isLoading || cargandoInicial}
                maxLength={OFERTA_TITULO_MAX_CHARS}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Título de la oferta"
                autoComplete="off"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {titulo.length}/{OFERTA_TITULO_MAX_CHARS}
              </p>
            </div>

            <div>
              <label
                htmlFor="oferta-descripcion"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>
              <textarea
                id="oferta-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={isLoading || cargandoInicial}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Texto de la oferta (~50 palabras)"
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h2 className="border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              English
            </h2>
            <div>
              <label
                htmlFor="oferta-titulo-en"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Title{" "}
                <span className="font-normal text-slate-500">
                  (max {OFERTA_TITULO_MAX_CHARS} chars, hero pill)
                </span>
              </label>
              <input
                id="oferta-titulo-en"
                type="text"
                value={tituloEn}
                onChange={(e) => setTituloEn(e.target.value)}
                disabled={isLoading || cargandoInicial}
                maxLength={OFERTA_TITULO_MAX_CHARS}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Offer title"
                autoComplete="off"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {tituloEn.length}/{OFERTA_TITULO_MAX_CHARS}
              </p>
            </div>

            <div>
              <label
                htmlFor="oferta-descripcion-en"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="oferta-descripcion-en"
                value={descripcionEn}
                onChange={(e) => setDescripcionEn(e.target.value)}
                disabled={isLoading || cargandoInicial}
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Offer description (~50 words)"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={isLoading || cargandoInicial}
            className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>

          {mensaje && (
            <p
              role="status"
              className={`text-sm ${
                mensaje.tipo === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensaje.texto}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
