import { notFound } from "next/navigation";
import { getBookingForCancel, isRefundable } from "@/app/actions/cancelBooking";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import CancelarClient from "./CancelarClient";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ email?: string }>;
};

function roomLabel(roomId: string): string {
  return roomId === "room_1"
    ? "Junior Suite I"
    : roomId === "room_2"
      ? "Junior Suite II"
      : "TWO-BEDROOM SUITE (Villa Completa)";
}

export default async function CancelarReservaPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { email } = await searchParams;

  if (!email?.trim()) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
        <div className="container max-w-lg mx-auto text-center">
          <p className="font-sans text-white/80">
            Use el enlace que recibió en el email de confirmación para acceder a la cancelación.
          </p>
        </div>
      </main>
    );
  }

  const booking = await getBookingForCancel(id, email.trim());
  if (!booking) notFound();

  const alreadyCancelled =
    booking.status === "cancelled_refund" || booking.status === "cancelled_no_refund";
  const today = startOfDay(new Date());
  const checkInDate = startOfDay(parseISO(booking.check_in));
  const daysUntilCheckIn = differenceInDays(checkInDate, today);
  const refundable = isRefundable(daysUntilCheckIn);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container max-w-lg mx-auto">
        <h1 className="font-serif text-2xl text-[#C5A059] mb-6 text-center">
          Cancelar reserva
        </h1>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <p className="font-sans text-sm text-white/70">Habitación</p>
          <p className="font-sans text-white">{roomLabel(booking.room_id)}</p>
          <p className="font-sans text-sm text-white/70 mt-3">Entrada / Salida</p>
          <p className="font-sans text-white">
            {booking.check_in} — {booking.check_out}
          </p>
          <p className="font-sans text-sm text-white/70 mt-3">Huésped</p>
          <p className="font-sans text-white">{booking.guest_name}</p>
          <p className="font-sans text-sm text-white/70 mt-3">Importe total</p>
          <p className="font-sans text-white">{booking.total_price} €</p>
        </div>

        {refundable ? (
          <div className="rounded-lg p-4 mb-6 bg-green-900/30 border border-green-500/50">
            <p className="font-sans text-sm text-green-200">
              Está a tiempo. Si cancela ahora, recibirá el 100% del importe.
            </p>
          </div>
        ) : (
          <div className="rounded-lg p-4 mb-6 bg-amber-900/30 border border-amber-500/50">
            <p className="font-sans text-sm text-amber-200">
              Está dentro de los 5 días previos a la llegada. Esta cancelación NO tiene reembolso.
            </p>
          </div>
        )}

        {alreadyCancelled ? (
          <div className="rounded-lg p-4 bg-white/10 text-center">
            <p className="font-sans text-white/90">Esta reserva ya está cancelada.</p>
          </div>
        ) : (
          <CancelarClient
            bookingId={booking.id}
            email={email.trim()}
            refundable={refundable}
          />
        )}
      </div>
    </main>
  );
}
