import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Metadata } from "next";

const SITE_URL = "https://www.casahereniaypedro.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const messages = isEn
    ? (await import("@/messages/en.json")).SEO
    : (await import("@/messages/es.json")).SEO;
  const keywords = (messages.keywords as string).split(", ");
  return {
    title: messages.title,
    description: messages.description,
    keywords,
    alternates: { canonical: `${SITE_URL}/${locale}` },
    openGraph: {
      title: messages.ogTitle,
      description: messages.ogDescription,
      url: `${SITE_URL}/${locale}`,
      siteName: "Casa Herenia y Pedro",
      images: [{ url: "/fondo.jpg", width: 1200, height: 630, alt: "Casa Herenia y Pedro, Viñales" }],
      locale: isEn ? "en_US" : "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: messages.ogTitle,
      description: messages.ogDescription,
      images: ["/fondo.jpg"],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en")) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </NextIntlClientProvider>
  );
}
