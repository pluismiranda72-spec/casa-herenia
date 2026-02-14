"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Cloud, Trash2 } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const SLOT_COUNT = 8;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Faltan variables de entorno de Cloudinary (CLOUD_NAME, UPLOAD_PRESET).");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Upload fallido: ${res.status}`);
  }
  const data = await res.json();
  return data.secure_url;
}

type SlotCellProps = {
  index: number;
  url: string | null;
  onUploaded: (index: number, url: string) => void;
  onRemove: (index: number) => void;
};

function SlotCell({ index, url, onUploaded, onRemove }: SlotCellProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setError(null);
      setLoading(true);
      try {
        const secureUrl = await uploadToCloudinary(file);
        onUploaded(index, secureUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir");
      } finally {
        setLoading(false);
      }
    },
    [index, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    disabled: !!url || loading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(index);
  };

  if (url) {
    return (
      <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 group">
        <Image
          src={optimizeCloudinaryUrl(url)}
          alt={`Habitación ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized={url.startsWith("http")}
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 rounded bg-red-500/90 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Eliminar foto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        h-48 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
        bg-gray-50
        ${isDragActive ? "border-[#C5A059] bg-[#C5A059]/5" : "border-gray-300 hover:border-gray-400"}
        ${loading ? "pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      {loading ? (
        <>
          <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Subiendo...</span>
        </>
      ) : (
        <>
          <Cloud className="w-8 h-8 text-gray-400" aria-hidden />
          <span className="text-sm text-gray-600 text-center px-2">
            Arrastra y suelta tu foto
          </span>
        </>
      )}
      {error && (
        <span className="text-xs text-red-600 text-center px-2">{error}</span>
      )}
    </div>
  );
}

type RoomPhotoUploaderProps = {
  initialUrls?: (string | null)[];
};

export default function RoomPhotoUploader({ initialUrls }: RoomPhotoUploaderProps) {
  const [images, setImages] = useState<(string | null)[]>(() => {
    const base = initialUrls?.slice(0, SLOT_COUNT) ?? [];
    const padded = [...base];
    while (padded.length < SLOT_COUNT) padded.push(null);
    return padded;
  });

  const handleUploaded = useCallback((index: number, url: string) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: SLOT_COUNT }, (_, i) => (
        <SlotCell
          key={i}
          index={i}
          url={images[i] ?? null}
          onUploaded={handleUploaded}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
