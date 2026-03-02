"use client";

import {
  Zap,
  Snowflake,
  Wifi,
  Coffee,
  Tv,
  Droplets,
  Shirt,
  Cookie,
  Languages,
} from "lucide-react";
import { useTranslations } from "next-intl";

const BENEFITS = [
  { id: "power", icon: Zap, key: "power" as const },
  { id: "ac", icon: Snowflake, key: "ac" as const },
  { id: "wifi", icon: Wifi, key: "wifi" as const },
  { id: "breakfast", icon: Coffee, key: "breakfast" as const },
  { id: "streaming", icon: Tv, key: "streaming" as const },
  { id: "water", icon: Droplets, key: "water" as const },
  { id: "laundry", icon: Shirt, key: "laundry" as const },
  { id: "snack", icon: Cookie, key: "snack" as const },
  { id: "english", icon: Languages, key: "english" as const },
];

export default function BenefitsSection() {
  const t = useTranslations("Benefits");

  return (
    <section
      className="w-full bg-[#f4f4f5] pt-8 pb-0 md:pt-12 md:pb-0"
      style={{ backgroundColor: "#f4f4f5" }}
      aria-labelledby="benefits-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="benefits-heading"
          className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight text-center mb-8 md:mb-12"
        >
          {t("title")}
        </h2>

        <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-3 md:flex md:flex-row md:flex-nowrap md:justify-around md:items-start md:gap-4 max-w-5xl mx-auto">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center text-center min-w-0"
              >
                <div className="rounded-full bg-white shadow-sm p-2 md:p-2 flex items-center justify-center mb-2 md:mb-3">
                  <Icon
                    className="w-5 h-5 md:w-6 md:h-6 text-[#C5A059] shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <h3 className="font-sans text-[10px] leading-tight sm:text-xs md:text-sm font-medium text-gray-800">
                  {t(item.key)}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
