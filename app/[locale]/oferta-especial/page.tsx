import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Special Offer: Your Private Retreat in Viñales | Casa Herenia y Pedro"
      : "Oferta Especial: Tu Refugio Privado en Viñales | Casa Herenia y Pedro",
    description: isEn
      ? "Book our three units together: total privacy, exclusive attention, and maximum capacity for families and groups in Viñales."
      : "Reserva nuestras tres unidades juntas: privacidad total, atención exclusiva y capacidad máxima para familias y grupos en Viñales.",
  };
}

const copy = {
  es: {
    kicker: "Experiencia integral",
    title: "Oferta Especial: Tu Refugio Privado en Viñales",
    cta: "Solicitar disponibilidad",
    ctaAria: "Ir a reservas para solicitar disponibilidad de la oferta de tres unidades",
    galleryAlt1: "Junior Suite I",
    galleryAlt2: "Junior Suite II",
    galleryAlt3: "Two-Bedroom Suite — espacio amplio para el grupo",
  },
  en: {
    kicker: "Full-property experience",
    title: "Special Offer: Your Private Retreat in Viñales",
    cta: "Request availability",
    ctaAria:
      "Go to booking to request availability for the three-unit special offer",
    galleryAlt1: "Junior Suite I",
    galleryAlt2: "Junior Suite II",
    galleryAlt3: "Two-Bedroom Suite — generous space for your group",
  },
} as const;

const ofertaBloqueCopy = {
  es: {
    heading: "¿Quieres alojarte 4 noches en Viñales?",
    lead: "Reserva 3 noches en nuestra casa particular en Viñales directamente desde la web y disfruta de la cuarta noche gratis.",
    b1: "• Haz tu reserva online de 3 noches.",
    b2: "• Escríbenos por WhatsApp para confirmar tu estancia.",
    b3: "• Te añadimos la 4ª noche sin coste adicional.",
    closingItalic:
      "Disfruta más tiempo de tu alojamiento en Viñales, con tranquilidad, comodidad y atención personalizada.",
  },
  en: {
    heading: "Want to stay 4 nights in Viñales?",
    lead: "Book 3 nights at our casa particular in Viñales directly through the website and enjoy the fourth night free.",
    b1: "• Book your 3-night stay online.",
    b2: "• Message us on WhatsApp to confirm your stay.",
    b3: "• We add your 4th night at no extra cost.",
    closingItalic:
      "Enjoy more time at your accommodation in Viñales, with peace of mind, comfort and personalised attention.",
  },
} as const;

const ofertaDescripcionCopy = {
  es: {
    intro:
      "Nuestro alojamiento está pensado para viajeros que buscan comodidad, tranquilidad y atención personalizada. Te ofrecemos un espacio acogedor donde descansar, organizar tus excursiones por Viñales y disfrutar de una experiencia auténtica en Cuba.",
    v1: "✔ Casa particular en Viñales con trato cercano y bilingüe.",
    v2: "✔ Ambiente tranquilo, ideal para desconectar.",
    v3: "✔ Asesoramiento para rutas y actividades en el valle.",
    v4: "✔ Reserva directa, clara y segura.",
    middle:
      "Al alojarte más días, podrás descubrir Viñales a tu ritmo: despertar con luz natural, disfrutar del desayuno sin aglomeraciones y volver cada tarde a un espacio donde sentirte como en casa.",
    cta:
      "👉 Solicita tus fechas y te confirmamos disponibilidad para aprovechar esta oferta especial de alojamiento en Viñales.",
  },
  en: {
    intro:
      "Our accommodation is designed for travellers seeking comfort, peace of mind and personalised attention. We offer a welcoming space to rest, plan your outings in Viñales and enjoy an authentic experience in Cuba.",
    v1: "✔ Casa particular in Viñales with friendly bilingual service.",
    v2: "✔ A peaceful atmosphere, perfect to unwind.",
    v3: "✔ Advice on routes and activities in the valley.",
    v4: "✔ Direct, clear and secure booking.",
    middle:
      "By staying longer, you can discover Viñales at your own pace: wake to natural light, enjoy breakfast without crowds and return each afternoon to a space that feels like home.",
    cta:
      "👉 Request your dates and we’ll confirm availability so you can take advantage of this special accommodation offer in Viñales.",
  },
} as const;

function OfertaDescripcionBloque({ locale }: { locale: string }) {
  const c = locale === "en" ? ofertaDescripcionCopy.en : ofertaDescripcionCopy.es;

  return (
    <div className="flex flex-col text-left space-y-4 w-full">
      <p className="text-sm md:text-base text-gray-700 text-balance leading-relaxed">
        {c.intro}
      </p>
      <div className="flex flex-col space-y-2 text-sm md:text-base text-gray-800 font-medium ml-1">
        <p>{c.v1}</p>
        <p>{c.v2}</p>
        <p>{c.v3}</p>
        <p>{c.v4}</p>
      </div>
      <p className="text-sm md:text-base text-gray-700 text-balance leading-relaxed">
        {c.middle}
      </p>
      <p className="font-bold text-base md:text-lg text-[#C5A059] pt-2">
        {c.cta}
      </p>
    </div>
  );
}

function OfertaEspecialBloque({ locale }: { locale: string }) {
  const isEn = locale === "en";
  const c = isEn ? ofertaBloqueCopy.en : ofertaBloqueCopy.es;

  return (
    <div className="relative z-20 mx-auto my-8 flex w-full max-w-2xl flex-col gap-6 px-4">
      <div className="rounded-xl border-2 border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-start justify-center text-left max-w-xl mx-auto space-y-4 px-4 md:px-6">
          <h3 className="font-bold text-lg md:text-xl text-balance">
            {c.heading}
          </h3>
          <p className="text-sm md:text-base text-balance text-gray-700">
            {c.lead}
          </p>
          <div className="text-sm md:text-base font-medium flex flex-col space-y-1 text-gray-800">
            <p>{c.b1}</p>
            <p>{c.b2}</p>
            <p>{c.b3}</p>
          </div>
          <p className="text-sm md:text-base text-balance text-gray-700 italic">
            {c.closingItalic}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function OfertaEspecialPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === "en";
  const t = isEn ? copy.en : copy.es;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-emerald-100/80">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Nueva.webp"
            alt="Amanecer en el Valle de Viñales desde Casa Herenia y Pedro"
            fill
            className="object-cover"
            priority={true}
            sizes="100vw"
            quality={100}
            unoptimized={true}
          />
          {/* Nuevo overlay oscuro para legibilidad sin tinte verde */}
          <div
            className="absolute inset-0 bg-black/30 z-10"
            aria-hidden="true"
          ></div>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
          <p className="hidden md:block mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-800/90">
            {t.kicker}
          </p>
          <h1 className="text-balance font-serif text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-[2.65rem]">
            {t.title}
          </h1>
        </div>
      </section>

      {/* Main */}
      <main className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="flex flex-col justify-center space-y-8 text-slate-700">
            <OfertaEspecialBloque locale={locale} />

            <OfertaDescripcionBloque locale={locale} />
            <div className="pt-2">
              <Link
                href="/reservas"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label={t.ctaAria}
              >
                {t.cta}
              </Link>
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:justify-center">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/room-1.jpg"
                    alt={t.galleryAlt1}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/room-2.jpg"
                    alt={t.galleryAlt2}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
              <div className="relative aspect-[21/9] w-full sm:aspect-[16/9]">
                <Image
                  src="/doble-estancia.png"
                  alt={t.galleryAlt3}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
            </figure>
          </aside>
        </div>
      </main>
    </div>
  );
}
