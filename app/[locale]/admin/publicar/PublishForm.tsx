"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { useFormState } from "react-dom";
import { createPost } from "@/app/actions/createPost";

const MAX_VIDEO_MB = 10;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;

type PostType = "standard" | "instagram";

export default function PublishForm() {
  const [state, formAction] = useFormState(createPost, null);
  const [postType, setPostType] = useState<PostType>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [content, setContent] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setProgress(10);
    let finalFile = f;
    if (f.type.startsWith("image/")) {
      try {
        finalFile = await imageCompression(f, {
          maxSizeMB: 1.2,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          onProgress: (p) => setProgress(Math.round(p)),
        });
      } catch (e) {
        console.error("Compression:", e);
      }
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(finalFile);
    } else if (f.type.startsWith("video/")) {
      if (f.size > MAX_VIDEO_BYTES) {
        alert(`El vídeo no puede superar ${MAX_VIDEO_MB}MB. Este pesa ${(f.size / 1024 / 1024).toFixed(1)}MB.`);
        return;
      }
      setMediaType("video");
      setPreview(URL.createObjectURL(f));
    }
    setProgress(100);
    setFile(finalFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: postType === "instagram"
      ? { "image/*": [".jpg", ".jpeg", ".png", ".webp"] }
      : {
          "image/*": [".jpg", ".jpeg", ".png", ".webp"],
          "video/mp4": [".mp4"],
          "video/webm": [".webm"],
        },
    maxSize: postType === "instagram" ? 10 * 1024 * 1024 : MAX_VIDEO_BYTES,
  });

  const removeFile = () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("post_type", postType);
    fd.set("media_type", mediaType);
    if (postType === "instagram") {
      fd.set("instagram_url", instagramUrl.trim());
    }
    fd.set("content", content);
    if (file) fd.set("media", file);
    formAction(fd);
  };

  const canSubmit =
    postType === "standard" ? !!file : !!file && !!instagramUrl.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <input type="hidden" name="post_type" value={postType} />
      <input type="hidden" name="media_type" value={mediaType} />

      {/* Tabs: Subir Historia vs Embeber Instagram */}
      <div className="flex border-b border-white/20">
        <button
          type="button"
          onClick={() => setPostType("standard")}
          className={`px-4 py-2 font-sans text-sm font-medium transition-colors ${
            postType === "standard"
              ? "text-[#C5A059] border-b-2 border-[#C5A059]"
              : "text-white/70 hover:text-white"
          }`}
        >
          Subir Historia
        </button>
        <button
          type="button"
          onClick={() => {
            setPostType("instagram");
            if (mediaType === "video") {
              removeFile();
            }
          }}
          className={`px-4 py-2 font-sans text-sm font-medium transition-colors ${
            postType === "instagram"
              ? "text-[#C5A059] border-b-2 border-[#C5A059]"
              : "text-white/70 hover:text-white"
          }`}
        >
          Embeber Instagram
        </button>
      </div>

      <label className="block">
        <span className="font-sans text-sm text-[#C5A059] mb-1 block">Título *</span>
        <input
          type="text"
          name="title"
          required
          placeholder={postType === "instagram" ? "Ej: Post de Instagram - Viñales" : undefined}
          className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-[#C5A059]/30 text-white font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
        />
      </label>

      {postType === "instagram" && (
        <>
          <label className="block">
            <span className="font-sans text-sm text-[#C5A059] mb-1 block">URL del Post de Instagram *</span>
            <input
              type="url"
              name="instagram_url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              required
              placeholder="https://www.instagram.com/p/..."
              className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-[#C5A059]/30 text-white font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
            />
          </label>
          <label className="block">
            <span className="font-sans text-sm text-[#C5A059] mb-1 block">Texto de la publicación (Opcional)</span>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Pega aquí el texto inspirador..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-[#C5A059]/30 text-white font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 resize-y placeholder:text-white/40"
            />
          </label>
        </>
      )}

      {postType === "standard" && (
        <>
          <label className="block">
            <span className="font-sans text-sm text-[#C5A059] mb-1 block">Resumen (excerpt)</span>
            <input
              type="text"
              name="excerpt"
              maxLength={500}
              className="w-full min-h-[44px] px-4 rounded-lg bg-white/10 border border-[#C5A059]/30 text-white font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50"
            />
          </label>
          <label className="block">
            <span className="font-sans text-sm text-[#C5A059] mb-1 block">Contenido</span>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-[#C5A059]/30 text-white font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/50 resize-y"
            />
          </label>
        </>
      )}

      <div>
        <span className="font-sans text-sm text-[#C5A059] mb-2 block">
          {postType === "instagram"
            ? "Sube la Foto de Portada (Se verá en la tarjeta) *"
            : "Foto o vídeo (arrastrar o clic) *"}
        </span>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-[#C5A059] bg-[#C5A059]/10" : "border-white/30 hover:border-[#C5A059]/50"
          }`}
        >
          <input {...getInputProps()} />
          <p className="font-sans text-sm text-white/80">
            {isDragActive ? "Suelta aquí..." : postType === "instagram"
              ? "Arrastra una imagen o haz clic. Será la portada de la tarjeta en la web."
              : "Arrastra un archivo o haz clic. Imágenes comprimidas; vídeos máx. 10MB (mp4/webm)."}
          </p>
        </div>
        {preview && (
          <div className="mt-4 relative">
            {mediaType === "image" ? (
              <img src={preview} alt="Vista previa" className="max-h-64 rounded-lg object-cover mx-auto" />
            ) : (
              <video src={preview} controls className="max-h-64 rounded-lg mx-auto" />
            )}
            <p className="mt-2 font-sans text-xs text-white/60">
              {progress > 0 && progress < 100 && `Comprimiendo... ${progress}%`}
              {progress === 100 && file && `${file.name} (${(file.size / 1024).toFixed(0)} KB)`}
            </p>
            <button type="button" onClick={removeFile} className="mt-2 text-red-400 text-sm hover:underline">
              Quitar
            </button>
          </div>
        )}
      </div>

      {state && !state.success && <p className="font-sans text-sm text-red-400" role="alert">{state.error}</p>}
      {state?.success && <p className="font-sans text-sm text-[#C5A059]">Entrada publicada.</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Publicar
      </button>
    </form>
  );
}
