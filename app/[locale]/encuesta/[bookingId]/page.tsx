import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SurveyForm from "./SurveyForm";

type Props = { params: Promise<{ locale: string; bookingId: string }> };

export default async function EncuestaPage({ params }: Props) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, guest_name")
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !booking) notFound();

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existing) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4">
        <p className="font-sans text-center text-white/80">
          Ya ha enviado una opinión para esta reserva. ¡Gracias!
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-xl">
        <h1 className="font-serif text-2xl md:text-3xl text-center text-white mb-2">
          ¿Cómo fue su estancia en Casa Herenia y Pedro?
        </h1>
        <p className="font-sans text-sm text-white/60 text-center mb-10">
          Su opinión nos ayuda a mejorar. Solo le tomará 2 minutos.
        </p>
        <SurveyForm
          bookingId={bookingId}
          defaultAuthorName={booking.guest_name ?? ""}
        />
      </div>
    </main>
  );
}
