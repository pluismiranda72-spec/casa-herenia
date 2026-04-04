import type { Property } from "@/data/properties";

type Unit = Property["unit"];

type Props = {
  unit: Unit;
  /** Nombre corto desde traducciones (móvil); sin cambios respecto al comportamiento actual. */
  mobileName: string;
};

/**
 * Móvil: nombre original (traducción). Escritorio (md+): etiquetas largas en una sola línea.
 */
export default function RoomResponsiveName({ unit, mobileName }: Props) {
  return (
    <>
      <span className="md:hidden">{mobileName}</span>
      {unit === "room_1" && (
        <span className="hidden md:inline md:text-lg lg:text-base md:whitespace-nowrap md:tracking-tight">
          Habitación Privada #1 Viñales
        </span>
      )}
      {unit === "room_2" && (
        <span className="hidden md:inline md:text-lg lg:text-base md:whitespace-nowrap md:tracking-tight">
          Habitación Privada #2 Viñales
        </span>
      )}
      {unit === "full_villa" && (
        <span className="hidden md:inline md:text-lg lg:text-[0.95rem] md:whitespace-nowrap md:tracking-tight">
          Habitación Familar Viñales (2 Dormitorios)
        </span>
      )}
    </>
  );
}
