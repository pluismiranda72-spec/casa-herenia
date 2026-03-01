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

export default function RoomGallery() {
  const t = useTranslations("Rooms");
  const [selectedRoom, setSelectedRoom] = useState<Property | null>(null);

  return (
    <section
      id="estancias"
      className="w-full py-12 md:py-24 px-4 md:px-6 bg-brand-white"
      aria-labelledby="room-gallery-heading"
    >
      <div className="container mx-auto">
        <h2
          id="room-gallery-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-black text-center mb-8 md:mb-12"
        >
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {PROPERTIES.map((property, index) => {
            const name = t(`${property.unit}.name`);
            const desc = t(`${property.unit}.desc`);
            return (
              <motion.article
                key={property.id}
                className="group relative overflow-hidden rounded-xl shadow-lg"
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
                        {name}
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
        roomSlug={selectedRoom?.id ?? ""}
        images={selectedRoom?.galleryImages ?? []}
      />
    </section>
  );
}
