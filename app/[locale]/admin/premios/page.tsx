"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "ml_default";

const SLOT_COUNT = 10;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local");
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

type Award = {
  id: string;
  image_url: string;
  position: number;
  created_at: string;
};

type SlotCellProps = {
  position: number;
  award: Award | null;
  onUploaded: (position: number, url: string) => void;
  onRemove: (position: number) => void;
};

function SlotCell({ position, award, onUploaded, onRemove }: SlotCellProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setError(null);
      setLoading(true);
      try {
        const url = await uploadToCloudinary(file);
        onUploaded(position, url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir");
      } finally {
        setLoading(false);
      }
    },
    [position, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    disabled: !!award || loading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(position);
  };

  if (award) {
    return (
      <div className="relative h-36 w-full rounded-lg overflow-hidden bg-gray-100 group">
        <Image
          src={optimizeCloudinaryUrl(award.image_url)}
          alt={`Premio ${position}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 20vw"
          unoptimized={award.image_url.startsWith("http")}
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 z-10 p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          aria-label="Eliminar premio"
        >
          Eliminar
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        h-36 w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
        bg-gray-50
        ${isDragActive ? "border-[#C5A059] bg-[#C5A059]/5" : "border-gray-300 hover:border-gray-400"}
        ${loading ? "pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      {loading ? (
        <>
          <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500">Subiendo...</span>
        </>
      ) : (
        <span className="text-sm text-gray-600 text-center px-2 font-sans">
          Arrastra Premio #{position}
        </span>
      )}
      {error && (
        <span className="text-xs text-red-600 text-center px-2">{error}</span>
      )}
    </div>
  );
}

export default function AdminPremiosPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAwards = useCallback(async () => {
    const { data } = await supabase
      .from("awards")
      .select("*")
      .order("position", { ascending: true });
    setAwards(data ?? []);
  }, []);

  useEffect(() => {
    fetchAwards().finally(() => setLoading(false));
  }, [fetchAwards]);

  const getAwardByPosition = (pos: number) => awards.find((a) => a.position === pos) ?? null;

  async function handleUploaded(position: number, url: string) {
    const existing = awards.find((a) => a.position === position);
    if (existing) {
      const { error } = await supabase
        .from("awards")
        .update({ image_url: url })
        .eq("id", existing.id);
      if (error) {
        alert("Error al actualizar: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("awards")
        .insert({ image_url: url, position });
      if (error) {
        alert("Error al guardar: " + error.message);
        return;
      }
    }
    await fetchAwards();
  }

  async function handleRemove(position: number) {
    const row = awards.find((a) => a.position === position);
    if (!row) return;
    if (!window.confirm("¿Eliminar este premio?")) return;
    const { error } = await supabase.from("awards").delete().eq("id", row.id);
    if (error) {
      alert("Error al eliminar: " + error.message);
      return;
    }
    await fetchAwards();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
        <div className="container mx-auto text-center font-sans text-white/70">
          Cargando premios...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-[#C5A059] mb-2">
          Premios de la Casa
        </h1>
        <p className="font-sans text-sm text-white/70 mb-8 max-w-2xl">
          Arrastra y suelta hasta 10 imágenes de premios. Se subirán a Cloudinary y se mostrarán en la Home.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: SLOT_COUNT }, (_, i) => i + 1).map((pos) => (
            <SlotCell
              key={pos}
              position={pos}
              award={getAwardByPosition(pos)}
              onUploaded={handleUploaded}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
