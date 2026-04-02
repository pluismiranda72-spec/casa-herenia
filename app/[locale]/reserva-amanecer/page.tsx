import ReservaAmanecerClient from "@/components/ReservaAmanecerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disponibilidad: Amanecer en Los Acuáticos | Casa Herenia y Pedro",
  description: "Consulta fechas para la excursión Amanecer en Los Acuáticos, Viñales.",
};

export default function ReservaAmanecerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8 md:py-12 w-full">
      <ReservaAmanecerClient />
    </div>
  );
}
