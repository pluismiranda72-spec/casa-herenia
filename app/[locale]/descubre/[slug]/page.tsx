import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";

export const revalidate = 60;

const LOCALES = ["es", "en"] as const;

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

async function fetchPostBySlug(slug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("title, title_en, excerpt, excerpt_en, content, content_en, media_url, media_type")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

const getCachedPost = (slug: string) =>
  unstable_cache(
    () => fetchPostBySlug(slug),
    ["descubre-post", slug],
    { revalidate: 60, tags: ["descubre-posts"] }
  );

async function getAllPostSlugs(): Promise<string[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from("posts").select("slug").order("created_at", { ascending: false });
    return (data ?? []).map((r) => r.slug as string);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.flatMap((slug) => LOCALES.map((locale) => ({ locale, slug })));
}

const VIDEO_POSTER_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gADAwEAAhEDEEA/ALmi6tqF1pVrcXN5PNNIm53eRiSfZooqJZQp/9k=";

const CITY_LINKS = [
  { name: "La Habana", url: "https://www.travelwithpau.com/la-habana/" },
  { name: "Viñales", url: "https://www.instagram.com/casa_herenia_y_pedro?igsh=ejBpeTUydWl3Yzdt" },
  { name: "Cienfuegos", url: "https://www.surfingtheplanet.com/que-ver-cienfuegos/" },
  { name: "Trinidad", url: "https://imanesdeviaje.com/que-ver-en-trinidad-cuba/" },
  { name: "Varadero", url: "https://lostraveleros.com/que-hacer-en-varadero/" },
] as const;

// Optimización: Pre-compilamos los patrones Regex fuera de la función de renderizado
const CITY_PATTERNS = CITY_LINKS.map((link) => ({
  ...link,
  regex: new RegExp(`(\\d+\\.\\s*)(${link.name})`, "i"),
}));

function processCityContent(content: string): string {
  if (!content) return "";

  let processedHtml = content.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");

  for (const { regex, url } of CITY_PATTERNS) {
    processedHtml = processedHtml.replace(regex, (match, prefix, cityName) => {
      return `<br /><br />${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#38B6FF] font-semibold no-underline hover:underline transition-all duration-200 ease-in-out">${cityName}</a>`;
    });
  }

  return processedHtml;
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getCachedPost(slug)();
  const title = locale === "en" ? data?.title_en || data?.title : data?.title;
  const description = locale === "en" ? data?.excerpt_en || data?.excerpt : data?.excerpt;

  return {
    title: title ? `${title} | Casa Herenia y Pedro` : "Descubre Viñales",
    description: description || undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params;
  const post = await getCachedPost(slug)();
  if (!post) notFound();

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
                className="object-cover bg-gray-200"
                priority={true}
                fetchPriority="high"
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            ) : (
              <video
                src={post.media_url}
                controls
                className="w-full h-full object-cover bg-gray-200"
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
          <div
            className="descubre-post-content font-sans prose prose-lg max-w-none text-[#0A0A0A]/90 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: processCityContent(content) }}
          />
        )}
      </article>
    </main>
  );
}