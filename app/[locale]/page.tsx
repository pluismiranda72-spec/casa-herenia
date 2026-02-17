import HeroSection from "@/components/HeroSection";
import RoomGallery from "@/components/RoomGallery";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import ViñalesMiniWidget from "@/components/ViñalesMiniWidget";
import Footer from "@/components/Footer";
import ThanksBanner from "@/components/ThanksBanner";

type HomeProps = { searchParams: Promise<{ thanks?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen flex-col">
      <ThanksBanner thanks={params.thanks ?? null} />
      {/* 1. Portada */}
      <HeroSection />
      
      {/* 2. Habitaciones */}
      <RoomGallery />
      
      {/* 3. Servicios / Comodidades */}
      <BenefitsSection />
      
      {/* 4. Reseñas (internas + enlace TripAdvisor) */}
      <TestimonialsSection />
      
      {/* 5. Ubicación y llegada */}
      <LocationSection />
      
      {/* Descubre Viñales - widget */}
      <ViñalesMiniWidget />
      
      {/* 7. Pie de página */}
      <Footer />
    </main>
  );
}