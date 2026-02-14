import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title, excerpt").eq("slug", slug).maybeSingle();
  return {
    title: data?.title ? `${data.title} | Descubre Viñales` : "Descubre Viñales",
    description: data?.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  if (error || !post) notFound();

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#0A0A0A]">
      <article className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-6" style={{ fontFamily: "var(--font-playfair), serif" }}>
          {post.title}
        </h1>
        {post.media_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-200">
            {post.media_type === "image" ? (
              <Image
                src={post.media_url}
                alt={post.title}
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
        {post.excerpt && <p className="font-sans text-lg text-[#0A0A0A]/80 mb-6">{post.excerpt}</p>}
        {post.content && (
          <div
            className="font-sans prose prose-lg max-w-none text-[#0A0A0A]/90"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
          />
        )}
      </article>
    </main>
  );
}
