import RoomPhotoUploader from "@/components/admin/RoomPhotoUploader";

export default function AdminFotosPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl text-[#C5A059] mb-2">
          Fotos de habitaciones
        </h1>
        <p className="font-sans text-sm text-white/70 mb-8 max-w-2xl">
          Arrastra y suelta una imagen en cada hueco. Se subirán a Cloudinary.
          Configura <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> y{" "}
          <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> en tu .env.local.
        </p>
        <RoomPhotoUploader />
      </div>
    </main>
  );
}
