"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PROPERTIES } from "@/data/properties";
import type { Property } from "@/data/properties";
import RoomDetailsModal from "@/components/RoomDetailsModal";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import { CURRENCY_SYMBOL } from "@/lib/constants/currency";
import { Link } from "@/i18n/navigation";
import RoomResponsiveName from "@/components/RoomResponsiveName";

function RoomsTitle({ title }: { title: string }) {
  const colonIndex = title.indexOf(":");
  if (colonIndex === -1) {
    return <>{title}</>;
  }
  const beforeColon = title.slice(0, colonIndex + 1);
  const afterColon = title.slice(colonIndex + 1).trimStart();
  return (
    <>
      {beforeColon}
      {" "}
      <br className="block sm:hidden" />
      {afterColon}
    </>
  );
}

export default function RoomGallery() {
  const t = useTranslations("Rooms");
  const [selectedRoom, setSelectedRoom] = useState<Property | null>(null);

  return (
    <section
      id="estancias"
      className="relative w-full overflow-hidden py-16 md:py-24"
      aria-labelledby="room-gallery-heading"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/images/06.jpeg"
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          loading="eager"
        />
        {/* Nuevo overlay oscuro para legibilidad sin tinte verde */}
        <div
          className="absolute inset-0 bg-black/30 z-10"
          aria-hidden="true"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Link
          href="/reserva-segura"
          className="flex md:hidden relative z-10 w-fit mx-auto max-md:mt-4 max-md:-translate-y-[60px] max-md:mb-6 px-2 py-0.5 border border-white/80 rounded-md text-sm font-bold text-white tracking-wide no-underline transition-all hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {t("secureBookingMobile")}
        </Link>
        <div className="max-md:w-full md:contents">
          <h2
            id="room-gallery-heading"
            className="max-md:-translate-y-[60px] font-serif text-[1.15rem] sm:text-3xl font-bold text-white tracking-tight text-center leading-snug mb-8 md:mb-12"
          >
            <RoomsTitle title={t("title")} />
          </h2>
        </div>

        {/* Contenedor para centrar el botón y darle espaciado */}
        <div className="flex justify-center mt-8 mb-12 w-full">
          <Link
            href="/oferta-especial"
            className="group inline-flex items-center gap-2 px-6 py-2.5 border-2 border-emerald-600 text-white font-semibold rounded-full text-sm transition-all duration-300 ease-in-out hover:bg-emerald-100/90 hover:text-emerald-900 hover:border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 text-white group-hover:text-emerald-900 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2z"
              />
            </svg>
            Oferta Especial
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {PROPERTIES.map((property, index) => {
            const name = t(`${property.unit}.name`);
            const desc = t(`${property.unit}.desc`);
            return (
              <motion.article
                key={property.id}
                className="group relative overflow-hidden rounded-xl bg-white shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 24px 48px rgba(0,0,0,0.14)",
                }}
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="relative">
                  <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl">
                    <Image
                      src={optimizeCloudinaryUrl(property.image)}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 pt-16 pb-5 px-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-xl">
                      <h3 className="font-serif text-xl md:text-2xl text-white">
                        <RoomResponsiveName unit={property.unit} mobileName={name} />
                      </h3>
                      <p className="mt-1 font-sans font-semibold text-gray-200">
                        {property.pricePerNight}{CURRENCY_SYMBOL}{t("perNight")}
                      </p>
                      <p className="mt-2 font-sans text-sm text-gray-200">
                        {desc}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedRoom(property)}
                        className="mt-4 inline-flex items-center justify-center min-h-[44px] px-4 py-2 font-sans text-sm text-white border-2 border-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-colors touch-target"
                      >
                        {t("viewDetails")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <RoomDetailsModal
        isOpen={selectedRoom !== null}
        onClose={() => setSelectedRoom(null)}
        roomTitle={selectedRoom?.name ?? ""}
        roomUnit={selectedRoom?.unit}
        roomTitleMobile={selectedRoom ? t(`${selectedRoom.unit}.name`) : ""}
        roomSlug={selectedRoom?.id ?? ""}
        images={selectedRoom?.galleryImages ?? []}
      />
    </section>
  );
}