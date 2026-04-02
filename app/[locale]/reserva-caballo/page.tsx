import ReservaCaballoClient from "@/components/ReservaCaballoClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disponibilidad: Ruta a Caballo en Viñales | Casa Herenia y Pedro",
  description: "Consulta fechas para la excursión Ruta a Caballo en Viñales.",
};

export default function ReservaCaballoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8 md:py-12 w-full">
      <ReservaCaballoClient />
    </div>
  );
}
