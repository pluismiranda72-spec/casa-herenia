import ReservaAmanecerClient from "@/components/ReservaAmanecerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disponibilidad: Amanecer en Los Acuáticos | Casa Herenia y Pedro",
  description: "Consulta fechas para la excursión Amanecer en Los Acuáticos, Viñales.",
};

export default function ReservaAmanecerPage() {
  return (
    <>
      <div className="md:hidden min-h-screen bg-gray-50" aria-hidden />
      <div className="hidden md:flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 w-full">
        <ReservaAmanecerClient />
      </div>
    </>
  );
}
