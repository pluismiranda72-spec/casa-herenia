import { Link } from "@/i18n/navigation";

type GraciasSearchParams = { name?: string; checkin?: string; checkout?: string };

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<GraciasSearchParams>;
}) {
  const params = await searchParams;
  const name =
    typeof params.name === "string" ? decodeURIComponent(params.name) : "";
  const checkin = params.checkin ?? "";
  const checkout = params.checkout ?? "";
  const displayName = name.trim() || "cliente";
  const displayCheckin = checkin || "[fecha entrada]";
  const displayCheckout = checkout || "[fecha salida]";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#C5A059]">
          ¡Reserva Confirmada!
        </h1>
        <p className="font-sans text-lg text-white leading-relaxed text-left">
          Señor(a) {displayName}: Usted tiene una reserva confirmada en nuestra
          casa para los días {displayCheckin} al {displayCheckout}. Gracias por
          escogernos, de veras que es un placer. Muy pronto nos pondremos en
          contacto con usted para ultimar detalles y brindarle cualquier ayuda
          que usted necesite. Saludos cordiales: Pedro y Herenia.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </main>
  );
}
