"use client";

/**
 * Skeleton para la sección de reseñas. Evita CLS reservando espacio
 * antes de que lleguen los datos. Misma geometría que la tarjeta real.
 */
export default function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="relative rounded-xl bg-gray-800 border border-gray-700/50 p-6 md:p-8 animate-pulse"
          role="status"
          aria-label="Cargando reseña"
        >
          {/* Badge placeholder */}
          <div className="absolute top-4 right-4 h-5 w-24 rounded-md bg-gray-700" />
          {/* Estrellas: 5 círculos */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-gray-700 shrink-0"
                aria-hidden
              />
            ))}
          </div>
          {/* Líneas del quote (altura de texto) */}
          <div className="mt-4 space-y-2">
            <div className="h-5 w-full rounded bg-gray-700" />
            <div className="h-5 w-full rounded bg-gray-700" />
            <div className="h-5 w-4/5 rounded bg-gray-700" />
          </div>
          {/* Autor */}
          <div className="mt-6 h-4 w-32 rounded bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
