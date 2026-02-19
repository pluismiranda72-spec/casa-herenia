import HeroSection from "@/components/HeroSection";
import RoomGallery from "@/components/RoomGallery";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import ViñalesMiniWidget from "@/components/ViñalesMiniWidget";
import ThanksBanner from "@/components/ThanksBanner";

type HomeProps = { searchParams: Promise<{ thanks?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen flex-col">
      <ThanksBanner thanks={params.thanks ?? null} />
      <HeroSection />
      <RoomGallery />
      <BenefitsSection />
      <TestimonialsSection />
      <LocationSection />
      <ViñalesMiniWidget />
    </main>
  );
}