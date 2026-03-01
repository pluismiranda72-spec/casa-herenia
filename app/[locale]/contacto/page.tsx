import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contact");
  return {
    title: `${t("title")} | Casa Herenia y Pedro`,
    description: t("pageDescription"),
  };
}

export default async function ContactoPage() {
  const t = await getTranslations("Contact");

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-[#C5A059] mb-8">
            {t("title")}
          </h1>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
