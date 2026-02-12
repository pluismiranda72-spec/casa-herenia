import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  },
});
