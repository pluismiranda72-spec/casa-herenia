import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Descubre Viñales | Casa Herenia y Pedro",
  description: "Historias, fotos y experiencias en Viñales.",
};

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/ALmi6tqF1pVrcXN5PNNIm53eRiSfZooqJZQp/9k=";

export default async function DescubrePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, media_url, media_type, created_at")
    .order("created_at", { ascending: false });

  const list = posts ?? [];

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#0A0A0A]">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-12 md:mb-16">
          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#0A0A0A] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Descubre Viñales
          </h1>
          <p
            className="font-sans text-lg text-[#0A0A0A]/70 max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Historias, fotos y momentos en el Valle.
          </p>
        </header>

        {list.length === 0 ? (
          <p className="text-center text-[#0A0A0A]/60 py-12 font-sans">
            Próximamente más contenidos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {list.map((post, i) => (
              <article
                key={post.id}
                className={`rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow ${
                  (i % 5 === 0 || i % 5 === 3) ? "lg:col-span-2" : ""
                }`}
              >
                <Link href={`/descubre/${post.slug}`} className="block">
                  <div className="relative aspect-[4/3] md:aspect-[3/2] bg-gray-200">
                    {post.media_url && post.media_type === "image" ? (
                      <Image
                        src={post.media_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA}
                        unoptimized={post.media_url.startsWith("http")}
                      />
                    ) : post.media_url && post.media_type === "video" ? (
                      <video
                        src={post.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C5A059] font-serif text-2xl">
                        Viñales
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h2
                      className="font-serif text-xl md:text-2xl text-[#0A0A0A] line-clamp-2"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 font-sans text-sm text-[#0A0A0A]/70 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
