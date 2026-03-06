import { getTranslations } from "next-intl/server";
import FAQSection from "@/components/FAQSection";
import type { Metadata } from "next";

const SITE_URL = "https://www.casahereniaypedro.com";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("FAQ");
  const title = t("title");
  return {
    title: `${title} | Casa Herenia y Pedro`,
    alternates: { canonical: `${SITE_URL}/${locale}/faq` },
  };
}

export default async function FAQPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <div className="flex-1 pt-8 pb-12">
        <FAQSection />
      </div>
    </main>
  );
}
