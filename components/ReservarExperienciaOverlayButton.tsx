"use client";

import { Link, useRouter } from "@/i18n/navigation";

const overlayClassName =
  "block absolute top-4 left-4 z-20 bg-sky-400 text-white text-sm px-2 py-0.5 rounded-lg font-semibold shadow-md hover:bg-sky-500 transition-all duration-300 scale-100 hover:scale-105";

const overlayStyle = { fontFamily: "var(--font-playfair), serif" } as const;

type Props = {
  /** Si es true, evita que el clic active el enlace padre de la tarjeta (catálogo). */
  stopParentClick?: boolean;
  /** Tours con calendario dedicado + Stripe: navega a /reserva-amanecer o /reserva-caballo. */
  reservaTarget?: "amanecer" | "caballo";
  navMode?: "catalog" | "detail";
};

export default function ReservarExperienciaOverlayButton({
  stopParentClick,
  reservaTarget,
  navMode,
}: Props) {
  const router = useRouter();
  const path = reservaTarget ? `/reserva-${reservaTarget}` : null;

  if (path && navMode === "detail") {
    return (
      <Link href={path} className={overlayClassName} style={overlayStyle}>
        Reservar experiencia
      </Link>
    );
  }

  if (path && navMode === "catalog") {
    return (
      <button
        type="button"
        className={overlayClassName}
        style={overlayStyle}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(path);
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
