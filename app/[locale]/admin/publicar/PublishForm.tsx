"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { useFormState } from "react-dom";
import { createPost } from "@/app/actions/createPost";

const MAX_VIDEO_MB = 10;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
const MIN_GALLERY_IMAGES = 3;
const MAX_GALLERY_IMAGES = 10;

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Faltan variables de entorno de Cloudinary (CLOUD_NAME, UPLOAD_PRESET).");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Upload fallido: ${res.status}`);
  }
  const data = await res.json();
  return data.secure_url;
}

type PostType = "standard" | "instagram";

export default function PublishForm() {
  const [state, formAction] = useFormState(createPost, null);
  const [postType, setPostType] = useState<PostType>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const isGallery = postType === "standard" && files.length >= MIN_GALLERY_IMAGES;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (postType === "instagram") {
      const f = acceptedFiles[0];
      if (!f) return;
      setProgress(10);
      let finalFile = f;
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
      setProgress(100);
      setFile(finalFile);
      setFiles([]);
      setPreviews([]);
      return;
    }

    const images = acceptedFiles.filter((f) => f.type.startsWith("image/"));
    const video = acceptedFiles.find((f) => f.type.startsWith("video/"));

    if (images.length >= MIN_GALLERY_IMAGES) {
      setMediaType("image");
      setFile(null);
      setPreview(null);
      setProgress(10);
      const compressed: File[] = [];
      const urls: string[] = [];
      for (let i = 0; i < Math.min(images.length, MAX_GALLERY_IMAGES); i++) {
        let finalFile = images[i];
        try {
          finalFile = await imageCompression(images[i], {
            maxSizeMB: 1.2,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            onProgress: (p) => setProgress(Math.round((p * (i + 1)) / images.length)),
          });
        } catch (e) {
          console.error("Compression:", e);
        }
        compressed.push(finalFile);
        const reader = new FileReader();
        reader.onload = () => {
          urls.push(reader.result as string);
          if (urls.length === compressed.length) setPreviews([...urls]);
        };
        reader.readAsDataURL(finalFile);
      }
      setProgress(100);
      setFiles(compressed);
      return;
    }

    if (images.length === 1 && !video) {
      setMediaType("image");
      setFiles([]);
      setPreviews([]);
      setProgress(10);
      let finalFile = images[0];
      try {
        finalFile = await imageCompression(images[0], {
          maxSizeMB: 1.2,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          onProgress: (p) => setProgress(Math.round(p)),
        });
      } catch (e) {
        console.error("Compression:", e);
      }
      setProgress(100);
      setFile(finalFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(finalFile);
      return;
    }

    if (video && acceptedFiles.length === 1) {
      if (video.size > MAX_VIDEO_BYTES) {
        alert(`El vídeo no puede superar ${MAX_VIDEO_MB}MB.`);
        return;
      }
      setMediaType("video");
      setFiles([]);
      setPreviews([]);
      setFile(video);
      setPreview(URL.createObjectURL(video));
      setProgress(100);
      return;
    }

    if (images.length === 2) {
      setMediaType("image");
      setFile(null);
      setPreview(null);
      const urls: string[] = [];
      images.forEach((img, i) => {
        const reader = new FileReader();
        reader.onload = () => {
          urls.push(reader.result as string);
          if (urls.length === 2) setPreviews([...urls]);
        };
        reader.readAsDataURL(img);
      });
      setProgress(100);
      setFiles(images);
    }
  }, [postType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: postType === "instagram" ? 1 : MAX_GALLERY_IMAGES,
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
    previews.forEach((p) => p.startsWith("blob:") && URL.revokeObjectURL(p));
    setFile(null);
    setFiles([]);
    setPreview(null);
    setPreviews([]);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("post_type", postType);
    fd.set("media_type", mediaType);
    if (postType === "instagram") {
      fd.set("instagram_url", instagramUrl.trim());
    }
    fd.set("content", content);

    if (isGallery && files.length >= MIN_GALLERY_IMAGES) {
      setUploading(true);
      try {
        const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
        fd.set("media_url", urls[0]);
        fd.set("gallery_urls", JSON.stringify(urls));
        formAction(fd);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al subir la galería.");
      } finally {
        setUploading(false);
      }
    } else {
      if (file) fd.set("media", file);
      formAction(fd);
    }
  };

  const canSubmit =
    postType === "instagram"
      ? !!file && !!instagramUrl.trim()
      : postType === "standard"
        ? (files.length >= MIN_GALLERY_IMAGES || !!file)
        : false;

  const showGalleryThumbnails = postType === "standard" && previews.length >= 2;
  const showSinglePreview = (postType === "instagram" || (postType === "standard" && !showGalleryThumbnails)) && preview;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <input type="hidden" name="post_type" value={postType} />
      <input type="hidden" name="media_type" value={mediaType} />

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
            if (mediaType === "video") removeFile();
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
            : "Foto o galería (mín. 3 fotos para carrusel) *"}
        </span>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-[#C5A059] bg-[#C5A059]/10" : "border-white/30 hover:border-[#C5A059]/50"
          }`}
        >
          <input {...getInputProps()} />
          <p className="font-sans text-sm text-white/80">
            {isDragActive
              ? "Suelta aquí..."
              : postType === "instagram"
                ? "Arrastra una imagen o haz clic."
                : "Arrastra 1 foto/vídeo o 3+ fotos para galería (máx. 10). Imágenes comprimidas; vídeos máx. 10MB."}
          </p>
        </div>

        {showGalleryThumbnails && (
          <div className="mt-4">
            <p className="font-sans text-xs text-[#C5A059] mb-2">
              {previews.length >= MIN_GALLERY_IMAGES
                ? `Galería (${previews.length} fotos) — se subirán a Cloudinary al publicar.`
                : `Añade al menos ${MIN_GALLERY_IMAGES - previews.length} foto más para galería (mín. ${MIN_GALLERY_IMAGES}).`}
            </p>
            <div className="flex flex-wrap gap-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-white/20 shrink-0"
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button type="button" onClick={removeFile} className="mt-2 text-red-400 text-sm hover:underline">
              Quitar
            </button>
          </div>
        )}

        {showSinglePreview && (
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

      {state && !state.success && (
        <p className="font-sans text-sm text-red-400" role="alert">{state.error}</p>
      )}
      {state?.success && (
        <p className="font-sans text-sm text-[#C5A059]">Entrada publicada.</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || uploading}
        className="w-full min-h-[48px] rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Subiendo galería..." : "Publicar"}
      </button>
    </form>
  );
}
