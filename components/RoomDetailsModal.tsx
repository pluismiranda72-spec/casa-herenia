"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getGallery, saveImage } from "@/app/actions/galleryActions";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const SLOT_COUNT = 8;

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Faltan variables de entorno de Cloudinary.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error(`Upload fallido: ${res.status}`);
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
  const t = useTranslations("RoomModal");
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
        setError(e instanceof Error ? e.message : t("uploading"));
      } finally {
        setLoading(false);
      }
    },
    [index, onUploaded, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(index);
  };

  const slotContent = loading ? (
    <>
      <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-white/80">{t("uploading")}</span>
    </>
  ) : url ? (
    <>
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <Image
          src={optimizeCloudinaryUrl(url)}
          alt={`${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized={url.startsWith("http")}
        />
      </div>
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-red-500/90 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label={t("deletePhoto")}
      >
        <X className="w-4 h-4" />
      </button>
      {isDragActive && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center border-2 border-[#C5A059] border-dashed">
          <span className="text-sm text-white/90">{t("dropToReplace")}</span>
        </div>
      )}
    </>
  ) : (
    <>
      <CloudUpload className="w-8 h-8 text-white/60" aria-hidden />
      <span className="text-sm text-white/80 text-center px-2">
        {t("dragPhoto")}
      </span>
    </>
  );

  return (
    <div
      {...getRootProps()}
      className={`
        relative aspect-square w-full rounded-lg border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group
        ${url ? "border-transparent bg-white/10" : "border-dashed bg-black/30"}
        ${!url && (isDragActive ? "border-[#C5A059] bg-black/50" : "border-gray-500 hover:border-gray-400")}
        ${loading ? "pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      {slotContent}
      {error && (
        <span className="absolute bottom-2 left-2 right-2 text-xs text-red-400 text-center">{error}</span>
      )}
    </div>
  );
}

type RoomDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  roomSlug: string;
  images: string[];
};

export default function RoomDetailsModal({
  isOpen,
  onClose,
  roomTitle,
  roomSlug,
  images: _images,
}: RoomDetailsModalProps) {
  const t = useTranslations("RoomModal");
  const [slotUrls, setSlotUrls] = useState<(string | null)[]>(() =>
    Array(8).fill(null)
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !roomSlug) return;
    getGallery(roomSlug).then((urls) => setSlotUrls(urls));
  }, [isOpen, roomSlug]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleUploaded = useCallback(
    async (index: number, url: string) => {
      setSlotUrls((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
      const res = await saveImage(roomSlug, index, url);
      if (res.success) showToast(t("photoSaved"));
    },
    [roomSlug, showToast, t]
  );

  const handleRemove = useCallback(
    async (index: number) => {
      setSlotUrls((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      await saveImage(roomSlug, index, null);
    },
    [roomSlug]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="room-details-modal"
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="fixed inset-0 z-0 cursor-pointer"
            aria-label="Cerrar modal"
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="fixed top-24 right-30 md:right-20 z-[10050] bg-transparent border-none font-sans text-sm tracking-widest text-white cursor-pointer hover:text-[#C5A059] hover:underline underline-offset-4 py-2 touch-target"
            aria-label={t("close")}
          >
            {t("close")}
          </button>

          <div className="relative z-10 flex flex-1 flex-col min-h-0 overflow-auto pointer-events-none">
            <div className="pointer-events-auto px-4 py-3 md:px-6 md:py-4 shrink-0 pr-32 md:pr-40">
              <h2 className="font-serif text-lg md:text-xl text-white truncate">
                {roomTitle}
              </h2>
            </div>

            <div className="pointer-events-auto flex-1 px-4 pb-8 md:px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: SLOT_COUNT }, (_, i) => (
                  <SlotCell
                    key={i}
                    index={i}
                    url={slotUrls[i] ?? null}
                    onUploaded={handleUploaded}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[10060] px-4 py-2 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans text-sm shadow-lg"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
