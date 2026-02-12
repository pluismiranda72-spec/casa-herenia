"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type RoomDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  images: string[];
};

export default function RoomDetailsModal({
  isOpen,
  onClose,
  roomTitle,
  images,
}: RoomDetailsModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = images.length;

  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? total - 1 : i - 1));
  }, [total]);
  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= total - 1 ? 0 : i + 1));
  }, [total]);

  // Red de seguridad: Escape cierra el modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goPrev, goNext]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
          {/* Capa de fondo: clic cierra el modal (red de seguridad) */}
          <button
            type="button"
            onClick={handleClose}
            className="fixed inset-0 z-0 cursor-pointer"
            aria-label="Cerrar modal (clic en el fondo)"
          />

          {/* Botón de cierre: solo texto, alineado bajo el Navbar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="fixed top-24 right-30 md:right-20 lg:right-20 z-[10050] bg-transparent border-none font-sans text-sm tracking-widest text-white text-right cursor-pointer hover:text-[#C5A059] hover:underline underline-offset-4 transition-colors touch-target py-2"
            aria-label="Cerrar"
          >
            CERRAR
          </button>

          {/* Contenido del modal (pointer-events-none en el wrapper; auto en zonas interactivas para no cerrar al tocar foto/flechas/miniaturas) */}
          <div className="relative z-10 flex flex-1 flex-col min-h-0 pointer-events-none">
            {/* Cabecera: título */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 shrink-0 pr-32 md:pr-40">
              <h2 className="font-serif text-lg md:text-xl text-white truncate">
                {roomTitle}
              </h2>
            </div>

            {/* Imagen principal + flechas (área con pointer-events-auto) */}
            <div className="pointer-events-auto flex-1 flex items-center justify-center min-h-0 px-4 md:px-8">
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/40 hover:bg-black/60 transition-colors touch-target"
                aria-label="Foto anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center text-white/90 hover:text-white bg-black/40 hover:bg-black/60 transition-colors touch-target"
                aria-label="Siguiente foto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="relative w-full max-w-5xl h-full max-h-[60vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={images[currentIndex]!}
                      alt={`${roomTitle} - imagen ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 1280px"
                      unoptimized={images[currentIndex]!.startsWith("http")}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Tira de miniaturas (pointer-events-auto) */}
            <div className="pointer-events-auto shrink-0 px-4 py-4 md:py-6 overflow-x-auto">
              <div className="flex gap-2 justify-center min-w-0">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === currentIndex
                        ? "border-[#C5A059] ring-2 ring-[#C5A059]/50"
                        : "border-transparent hover:border-white/40"
                    }`}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={src.startsWith("http")}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
