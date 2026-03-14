import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const VIDEO_POSTER_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gADAwEAAhEDEEA/ALmi6tqF1pVrcXN5PNNIm53eRiSfZooqJZQp/9k=";

/**
 * Coloca el enlace solo en el nombre de la ciudad que encabeza cada sección numerada.
 * Reemplazos estáticos con .replace(); sin regex dinámicos ni split.
 */
function processCityContent(content: string): string {
  if (!content) return "";
  let out = content
    .replace(
      "1. La Habana",
      "1. <a href='https://www.travelwithpau.com/la-habana/' class='city-link' target='_blank' rel='noopener noreferrer'>La Habana</a>"
    )
    .replace(
      "2. Viñales",
      "2. <a href='https://www.instagram.com/casa_herenia_y_pedro?igsh=ejBpeTUydWl3Yzdt' class='city-link' target='_blank' rel='noopener noreferrer'>Viñales</a>"
    )
    .replace(
      "3. Cienfuegos",
      "3. <a href='https://www.surfingtheplanet.com/que-ver-cienfuegos/' class='city-link' target='_blank' rel='noopener noreferrer'>Cienfuegos</a>"
    )
    .replace(
      "4. Trinidad",
      "4. <a href='https://imanesdeviaje.com/que-ver-en-trinidad-cuba/' class='city-link' target='_blank' rel='noopener noreferrer'>Trinidad</a>"
    )
    .replace(
      "5. Varadero",
      "5. <a href='https://lostraveleros.com/que-hacer-en-varadero/' class='city-link' target='_blank' rel='noopener noreferrer'>Varadero</a>"
    );
  return out.replace(/\n/g, "<br />");
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title, title_en, excerpt, excerpt_en").eq("slug", slug).maybeSingle();
  
  const title = locale === "en" ? data?.title_en || data?.title : data?.title;
  const description = locale === "en" ? data?.excerpt_en || data?.excerpt : data?.excerpt;

  return {
    title: title ? `${title} | Casa Herenia y Pedro` : "Descubre Viñales",
    description: description || undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();

  if (error || !post) notFound();

  const title = locale === "en" ? post.title_en || post.title : post.title;
  const excerpt = locale === "en" ? post.excerpt_en || post.excerpt : post.excerpt;
  const content = locale === "en" ? post.content_en || post.content : post.content;

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#0A0A0A]">
      <article className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-5xl mb-8 leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {title}
        </h1>

        {post.media_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-sm bg-gray-100">
            {post.media_type === "image" ? (
              <Image
                src={post.media_url}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 900px) 100vw, 800px"
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full h-full object-cover"
                poster={VIDEO_POSTER_PLACEHOLDER}
              />
            )}
          </div>
        )}

        {excerpt && (
          <p className="font-sans text-xl leading-relaxed text-[#0A0A0A]/70 mb-10 border-l-4 border-[#38B6FF] pl-6 italic">
            {excerpt}
          </p>
        )}

        {content && (
          <>
            <style dangerouslySetInnerHTML={{ __html: `
              .descubre-post-content .city-link {
                color: #38B6FF !important;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.2s ease-in-out;
              }
              .descubre-post-content .city-link:hover {
                text-decoration: underline !important;
                color: #269ae6 !important; /* Un azul un poco más oscuro al pasar el ratón */
              }
              .descubre-post-content {
                line-height: 1.8;
              }
            `}} />
            <div
              className="descubre-post-content font-sans prose prose-lg max-w-none text-[#0A0A0A]/90"
              dangerouslySetInnerHTML={{ __html: processCityContent(content) }}
            />
          </>
        )}
      </article>
    </main>
  );
}