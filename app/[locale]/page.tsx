import HeroSection from "@/components/HeroSection";
import RoomGallery from "@/components/RoomGallery";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ExternalReviewsSection from "@/components/ExternalReviewsSection";
import LocationSection from "@/components/LocationSection";
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
      
      {/* 4. Reseñas Internas (Negras) */}
      <TestimonialsSection />
      
      {/* 5. Reseñas TripAdvisor (Doradas/Blancas) */}
      <ExternalReviewsSection />
      
      {/* 6. Ubicación y llegada */}
      <LocationSection />
      
      {/* 7. Pie de página */}
      <Footer />
    </main>
  );
}