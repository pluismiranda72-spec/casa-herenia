import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

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
    p2:
      "La atención se vuelve exclusiva: priorizamos tus horarios, tus dudas y tus peticiones con un trato cercano y bilingüe, como en casa. Disfrutarás de nuestro alojamiento, un pacio creado para descansar, conversar y planificar cada salida al mogote sin prisas.",
    p3:
      "Es la forma más serena de vivir Viñales: despertar con luz natural, desayunar sin aglomeraciones y volver por la tarde sabiendo que todo el refugio es vuestro. Solicita fechas y te confirmamos disponibilidad con la misma claridad que nuestra reserva segura.",
    cta: "Solicitar disponibilidad",
    ctaAria: "Ir a reservas para solicitar disponibilidad de la oferta de tres unidades",
    galleryAlt1: "Junior Suite I",
    galleryAlt2: "Junior Suite II",
    galleryAlt3: "Two-Bedroom Suite — espacio amplio para el grupo",
  },
  en: {
    kicker: "Full-property experience",
    title: "Special Offer: Your Private Retreat in Viñales",
    p2:
      "Attention becomes truly exclusive: we prioritise your timings, questions, and requests with friendly bilingual care. You benefit from the property’s maximum capacity, with room to rest, gather, and plan each outing to the mogotes at your own pace.",
    p3:
      "It’s the calmest way to experience Viñales: wake to natural light, breakfast without crowds, and return in the evening knowing the whole retreat is yours. Ask for dates and we’ll confirm availability with the same transparency as our secure booking flow.",
    cta: "Request availability",
    ctaAria:
      "Go to booking to request availability for the three-unit special offer",
    galleryAlt1: "Junior Suite I",
    galleryAlt2: "Junior Suite II",
    galleryAlt3: "Two-Bedroom Suite — generous space for your group",
  },
} as const;

function OfertaCajasEsqueleto() {
  return (
    <div className="relative z-20 mx-auto my-8 flex w-full max-w-2xl flex-col gap-6 px-4">
      <div className="w-full rounded-xl border-2 border-emerald-200 bg-emerald-50/30 px-6 py-2.5 text-center shadow-sm">
        <div
          className="mx-auto h-7 w-full max-w-none animate-pulse rounded-md bg-slate-200/80"
          aria-hidden
        />
      </div>
      <div className="border-2 border-emerald-100 bg-white rounded-xl p-6 md:p-8 shadow-sm">
        <div className="space-y-3" aria-hidden>
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-slate-200/80" />
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-slate-200/80" />
          <div className="mx-auto h-4 w-11/12 animate-pulse rounded bg-slate-200/80" />
          <div className="mx-auto h-4 w-full animate-pulse rounded bg-slate-200/80" />
        </div>
        <p className="sr-only">Cargando contenido de la oferta…</p>
      </div>
    </div>
  );
}

type OfertaRow = {
  titulo: string | null;
  descripcion: string | null;
  titulo_en: string | null;
  descripcion_en: string | null;
};

/** Lógica multi-idioma para el título en las cajas de oferta (Supabase). */
function textoTituloOferta(datos: OfertaRow | null, locale: string): string {
  if (locale === "en" && datos?.titulo_en?.trim()) {
    return datos.titulo_en.trim();
  }
  return datos?.titulo?.trim() || "Oferta Especial";
}

async function OfertaCajasDinamicas({ locale }: { locale: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oferta_especial")
    .select("titulo, descripcion, titulo_en, descripcion_en")
    .eq("id", 1)
    .maybeSingle();

  const datos: OfertaRow | null = error ? null : (data as OfertaRow | null);

  return (
    <div className="relative z-20 mx-auto my-8 flex w-full max-w-2xl flex-col gap-6 px-4">
      {/* Contenedor Principal de la Oferta — z-20 para flotar sobre el layout */}
      {/* 1. Rectángulo Superior: Título adaptable y multi-idioma */}
      <div className="w-full min-w-0 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 px-6 py-2.5 text-center shadow-sm">
        <h3 className="truncate text-sm font-bold text-slate-800">
          {textoTituloOferta(datos, locale)}
        </h3>
      </div>

      {/* 2. Rectángulo Inferior: Descripción ordenada, multi-idioma y alineada */}
      <div className="rounded-xl border-2 border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <p className="text-left text-lg leading-relaxed text-slate-600 whitespace-pre-line">
          {locale === "en" && datos?.descripcion_en?.trim()
            ? datos.descripcion_en.trim()
            : datos?.descripcion?.trim() ||
              "Descripción de la oferta especial."}
        </p>
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
          <img
            src="/images/06.jpeg"
            alt="Vista decorativa del Valle de Viñales"
            className="absolute inset-0 z-0 h-full w-full object-cover"
            loading="eager"
          />
          {/* Nuevo overlay oscuro para legibilidad sin tinte verde */}
          <div
            className="absolute inset-0 bg-black/30 z-10"
            aria-hidden="true"
          ></div>
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-emerald-800/90">
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
            {/* Contenedor Principal de la Oferta — datos desde Supabase */}
            <Suspense fallback={<OfertaCajasEsqueleto />}>
              <OfertaCajasDinamicas locale={locale} />
            </Suspense>

            <div className="space-y-6 text-base leading-relaxed md:text-[1.0625rem]">
              <p>{t.p2}</p>
              <p>{t.p3}</p>
            </div>
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
                />
              </div>
            </figure>
          </aside>
        </div>
      </main>
    </div>
  );
}
