export default {
  locales: ["es", "en"],
  defaultLocale: "es",
  messages: {
    es: () => import("./messages/es.json").then((m) => m.default),
    en: () => import("./messages/en.json").then((m) => m.default),
  },
};
