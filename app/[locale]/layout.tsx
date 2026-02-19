import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "es" | "en")) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Navbar />
      {children}
      <Footer />
      <ChatWidget />
    </NextIntlClientProvider>
  );
}
