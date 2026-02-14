import PublishForm from "./PublishForm";

export default function PublicarPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-[#C5A059] mb-8 text-center">
          Publicar en Descubre Viñales
        </h1>
        <PublishForm />
      </div>
    </main>
  );
}
