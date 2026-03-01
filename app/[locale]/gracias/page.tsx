import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type GraciasSearchParams = { name?: string; checkin?: string; checkout?: string };

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<GraciasSearchParams>;
}) {
  const t = await getTranslations("Gracias");
  const params = await searchParams;
  const name =
    typeof params.name === "string" ? decodeURIComponent(params.name) : "";
  const checkin = params.checkin ?? "";
  const checkout = params.checkout ?? "";
  const displayName = name.trim() || t("defaultName");
  const displayCheckin = checkin || t("defaultCheckin");
  const displayCheckout = checkout || t("defaultCheckout");

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#C5A059]">
          {t("title")}
        </h1>
        <p className="font-sans text-lg text-white leading-relaxed text-left">
          {t("body", {
            name: displayName,
            checkin: displayCheckin,
            checkout: displayCheckout,
          })}
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-lg bg-[#C5A059] text-[#0A0A0A] font-sans font-semibold hover:bg-[#C5A059]/90 transition-colors"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
