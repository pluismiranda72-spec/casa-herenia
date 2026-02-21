import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title, title_en, excerpt, excerpt_en").eq("slug", slug).maybeSingle();
  const title = data ? (locale === "en" && data.title_en?.trim() ? data.title_en : data.title) : null;
  const description = data ? (locale === "en" && data.excerpt_en?.trim() ? data.excerpt_en : data.excerpt) : null;
  return {
    title: title ? `${title} | Descubre Viñales` : "Descubre Viñales",
    description: description ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error || !post) notFound();

  const title = locale === "en" && (post as { title_en?: string | null }).title_en?.trim()
    ? (post as { title_en: string }).title_en
    : post.title;
  const excerpt = locale === "en" && (post as { excerpt_en?: string | null }).excerpt_en?.trim()
    ? (post as { excerpt_en: string }).excerpt_en
    : post.excerpt;
  const content = locale === "en" && (post as { content_en?: string | null }).content_en?.trim()
    ? (post as { content_en: string }).content_en
    : post.content;

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#0A0A0A]">
      <article className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {title}
        </h1>
        {post.media_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-200">
            {post.media_type === "image" ? (
              <Image
                src={post.media_url}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 800px"
                unoptimized={post.media_url.startsWith("http")}
              />
            ) : (
              <video src={post.media_url} controls className="w-full h-full object-cover" />
            )}
          </div>
        )}
        {excerpt && <p className="font-sans text-lg text-[#0A0A0A]/80 mb-6">{excerpt}</p>}
        {content && (
          <div
            className="font-sans prose prose-lg max-w-none text-[#0A0A0A]/90"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }}
          />
        )}
      </article>
    </main>
  );
}
