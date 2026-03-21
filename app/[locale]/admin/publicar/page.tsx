"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import dynamic from "next/dynamic";
import {
  Image as PhotoIcon,
  Newspaper,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CATEGORIES = [
  "Escalada",
  "Cultura Local",
  "Gastronomía",
  "Novedades Casa",
  "Tabaco",
] as const;

type ImageSlot = { file: File; preview: string } | null;

export default function PublicarPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [content, setContent] = useState("");
  /** Enlace de redirección (obligatorio si isRedirect; opcional si no) */
  const [instagramUrl, setInstagramUrl] = useState("");
  /** Publicación solo miniatura + salto a Instagram (sin artículo obligatorio) */
  const [isRedirect, setIsRedirect] = useState(false);
  const [status, setStatus] = useState<"borrador" | "publicado">("borrador");

  const [coverImage, setCoverImage] = useState<ImageSlot>(null);
  const [galleryImage1, setGalleryImage1] = useState<ImageSlot>(null);
  const [galleryImage2, setGalleryImage2] = useState<ImageSlot>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(
      e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    setImageState: React.Dispatch<React.SetStateAction<ImageSlot>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImageState({ file, preview: reader.result as string });
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const contentEmpty =
      !content.trim() || content === "<p><br></p>" || content === "<p></p>";

    if (isRedirect) {
      if (!title.trim()) {
        setMessage({ type: "error", text: "El título es obligatorio." });
        setIsLoading(false);
        return;
      }
      if (!coverImage) {
        setMessage({
          type: "error",
          text: "Con redirección directa, la foto de portada es obligatoria.",
        });
        setIsLoading(false);
        return;
      }
      const urlOk = /^https?:\/\/.+/i.test(instagramUrl.trim());
      if (!instagramUrl.trim() || !urlOk) {
        setMessage({
          type: "error",
          text: "Indica un enlace de redirección válido (https://…).",
        });
        setIsLoading(false);
        return;
      }
    } else {
      if (!title.trim() || contentEmpty) {
        setMessage({
          type: "error",
          text: "El título y el contenido del artículo son obligatorios.",
        });
        setIsLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("instagram_url", instagramUrl.trim());
    formData.append("instagramUrl", instagramUrl.trim());
    formData.append("is_redirect", isRedirect ? "true" : "false");
    formData.append("status", status);

    if (coverImage) formData.append("coverImage", coverImage.file);
    if (galleryImage1) formData.append("galleryImage1", galleryImage1.file);
    if (galleryImage2) formData.append("galleryImage2", galleryImage2.file);

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (response.ok && data.success !== false) {
        setMessage({ type: "success", text: "¡Publicación enviada con éxito!" });
        setTitle("");
        setSlug("");
        setContent("");
        setInstagramUrl("");
        setIsRedirect(false);
        setCoverImage(null);
        setGalleryImage1(null);
        setGalleryImage2(null);
      } else {
        setMessage({
          type: "error",
          text:
            typeof data.error === "string"
              ? data.error
              : "No se pudo guardar la publicación.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Error de conexión con el servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  function ImageUploader({
    label,
    state,
    setState,
    id,
  }: {
    label: string;
    state: ImageSlot;
    setState: React.Dispatch<React.SetStateAction<ImageSlot>>;
    id: string;
  }) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
        <label className="block text-xs font-bold text-gray-700 mb-2">
          {label}
        </label>
        {state ? (
          <button
            type="button"
            className="relative group cursor-pointer w-full text-left"
            onClick={() => setState(null)}
          >
            <img
              src={state.preview}
              alt={label}
              className="h-24 w-full object-cover rounded shadow-sm opacity-90 group-hover:opacity-50 transition-opacity"
            />
            <span className="absolute inset-0 flex items-center justify-center text-red-600 font-bold opacity-0 group-hover:opacity-100">
              Eliminar
            </span>
          </button>
        ) : (
          <label htmlFor={id} className="cursor-pointer flex flex-col items-center py-4">
            <PhotoIcon className="h-8 w-8 text-emerald-500 mb-1" />
            <span className="text-xs text-emerald-700 font-semibold cursor-pointer">
              Añadir foto
            </span>
            <input
              id={id}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setState)}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Newspaper className="h-8 w-8 text-emerald-600" aria-hidden />
        <h1 className="text-3xl font-bold text-gray-900">
          Crear Publicación Completa
        </h1>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded border font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Título de la Publicación
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="Ej: Nueva ruta de escalada..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-emerald-400 font-medium"
            />
          </div>

          <div
            className={`bg-white p-6 rounded-xl border shadow-sm ${
              isRedirect ? "ring-2 ring-amber-200/80" : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Activar redirección directa
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Solo miniatura + enlace externo (sin artículo obligatorio). El
                  editor de abajo pasa a ser opcional.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isRedirect}
                onClick={() => setIsRedirect((v) => !v)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  isRedirect ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition ${
                    isRedirect ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <label className="block text-sm font-bold text-gray-900 mb-2">
              Contenido (Editor Rico)
              {isRedirect ? (
                <span className="ml-2 text-xs font-normal text-amber-700">
                  (opcional si redirección está activa)
                </span>
              ) : null}
            </label>
            <div
              className={`h-72 mb-10 ${isRedirect ? "opacity-80" : ""}`}
            >
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                className="h-full rounded-lg"
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border shadow-sm ${
              isRedirect
                ? "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200"
                : "bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100"
            }`}
          >
            <label className="block text-sm font-bold text-pink-900 mb-2 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 shrink-0" aria-hidden />
              Enlace de redirección (Instagram)
              {isRedirect ? (
                <span className="text-red-600 text-xs font-semibold">*</span>
              ) : (
                <span className="text-xs font-normal text-pink-700">
                  (opcional)
                </span>
              )}
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-pink-400 text-sm border-pink-200"
              required={isRedirect}
            />
            <p className="text-xs text-pink-800 mt-2">
              {isRedirect
                ? "Obligatorio: URL completa del post o reel al que debe ir el visitante."
                : "Opcional: enlace relacionado. Activa el interruptor arriba para publicaciones solo de redirección."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">
              Galería de Imágenes (Máx. 3)
            </h3>
            {isRedirect ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                <strong>Portada obligatoria</strong> para la miniatura en la web
                antes de la redirección.
              </p>
            ) : null}
            <div className="space-y-3">
              <ImageUploader
                label="1. Portada Principal"
                state={coverImage}
                setState={setCoverImage}
                id="cover-upload"
              />
              <ImageUploader
                label="2. Foto de Detalle"
                state={galleryImage1}
                setState={setGalleryImage1}
                id="gallery1-upload"
              />
              <ImageUploader
                label="3. Foto de Paisaje"
                state={galleryImage2}
                setState={setGalleryImage2}
                id="gallery2-upload"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "borrador" | "publicado")
                }
                className="w-full px-4 py-2 border rounded-lg font-semibold"
              >
                <option value="borrador">Borrador (Oculto)</option>
                <option value="publicado">Publicar Ahora</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
              isLoading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" aria-hidden />
            ) : (
              "Guardar y Subir"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
