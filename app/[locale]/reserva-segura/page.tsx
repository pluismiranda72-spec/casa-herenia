import type { Metadata } from "next";
import ReservaSeguraContent from "./ReservaSeguraContent";

export const metadata: Metadata = {
  title: "Tu Reserva 100% Segura | Casa Herenia y Pedro",
  description:
    "Estándares europeos, corazón cubano. Reserva con confianza: pago seguro con Stripe, opiniones verificadas en TripAdvisor y atención personalizada.",
};

export default function ReservaSeguraPage() {
  return <ReservaSeguraContent />;
}
