"use client";

import { useRouter } from "@/i18n/navigation";

const overlayClassName =
  "hidden md:block absolute top-4 left-4 z-20 bg-sky-400 text-white text-sm px-2 py-0.5 rounded-lg font-semibold shadow-md hover:bg-sky-500 transition-all duration-300 scale-100 hover:scale-105";

const overlayStyle = { fontFamily: "var(--font-playfair), serif" } as const;

type Props = {
  /** Si es true, evita que el clic active el enlace padre de la tarjeta (catálogo). */
  stopParentClick?: boolean;
  /** Solo tour Amanecer: navegación al ancla #calendario-amanecer (sin <a> anidado en el catálogo). */
  amanecerNav?: "catalog" | "detail";
  slug?: string;
};

export default function ReservarExperienciaOverlayButton({
  stopParentClick,
  amanecerNav,
  slug,
}: Props) {
  const router = useRouter();

  if (amanecerNav === "detail") {
    return (
      <a href="#calendario-amanecer" className={overlayClassName} style={overlayStyle}>
        Reservar experiencia
      </a>
    );
  }

  if (amanecerNav === "catalog" && slug) {
    return (
      <button
        type="button"
        className={overlayClassName}
        style={overlayStyle}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/descubre/${slug}#calendario-amanecer`);
        }}
      >
        Reservar experiencia
      </button>
    );
  }

  return (
    <button
      type="button"
      className={overlayClassName}
      style={overlayStyle}
      onClick={
        stopParentClick
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
            }
          : undefined
      }
    >
      Reservar experiencia
    </button>
  );
}
