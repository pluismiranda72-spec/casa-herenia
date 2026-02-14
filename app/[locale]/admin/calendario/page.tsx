import {
  getBlockedDatesFromIcalAndBookings,
  getManualBlockedDatesByUnit,
  blockedDatesToYmd,
} from "@/lib/ical";
import { getManualBlocksForRoom } from "@/app/actions/manageCalendar";
import type { PropertyUnit } from "@/lib/ical";
import AdminCalendarioClient from "./AdminCalendarioClient";

const UNITS: PropertyUnit[] = ["room_1", "room_2", "full_villa"];

export default async function AdminCalendarioPage() {
  const [occupied, manual, blocks1, blocks2, blocks3] = await Promise.all([
    getBlockedDatesFromIcalAndBookings(),
    getManualBlockedDatesByUnit(),
    getManualBlocksForRoom("room_1"),
    getManualBlocksForRoom("room_2"),
    getManualBlocksForRoom("full_villa"),
  ]);

  const occupiedYmd = blockedDatesToYmd(occupied);
  const manualYmd = blockedDatesToYmd(manual);
  const initialManualBlocks = {
    room_1: blocks1,
    room_2: blocks2,
    full_villa: blocks3,
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-[#C5A059] mb-2">
          Gestión de disponibilidad
        </h1>
        <p className="font-sans text-sm text-white/70 mb-8 max-w-2xl">
          Bloquea o desbloquea fechas manualmente. Rojo = ocupado (Airbnb o reservas). Gris = bloqueo manual.
        </p>
        <AdminCalendarioClient
          occupiedYmd={occupiedYmd}
          manualYmd={manualYmd}
          initialManualBlocks={initialManualBlocks}
        />
      </div>
    </main>
  );
}
