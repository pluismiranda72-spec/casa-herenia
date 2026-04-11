import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Instagram } from "lucide-react";

const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/ALmi6tqF1pVrcXN5PNNIm53eRiSfZooqJZQp/9k=";

/** Fila típica de `posts` en Supabase (portada = `media_url`, no `cover_image`). */
export type PostCardData = {
  title: string;
  title_en?: string | null;
  slug: string;
  media_url: string | null;
  media_type?: string | null;
  instagram_url?: string | null;
  /** Si no existe en filas antiguas, se trata como false */
  is_redirect?: boolean | null;
};

export type PostCardProps = {
  post: PostCardData;
  /** Para elegir `title` vs `title_en` */
  locale?: string;
  /** Prioridad de columnas en grid (opcional) */
  className?: string;
};

function displayTitle(post: PostCardData, locale: string): string {
  return locale === "en" && post.title_en?.trim() ? post.title_en : post.title;
}

/**
 * Tarjeta de publicación para Descubre / blog.
 * - `is_redirect` + `instagram_url`: envuelve en `<a>` externo.
 * - En caso contrario: `<Link>` a `/descubre/[slug]`.
 */
export default function PostCard({ post, locale = "es", className = "" }: PostCardProps) {
  const isRedirect = Boolean(post.is_redirect);
  const externalUrl = post.instagram_url?.trim() ?? "";
  const useExternal = isRedirect && Boolean(externalUrl);

  const title = displayTitle(post, locale);
  const cover = post.media_url;
  const isImage = !post.media_type || post.media_type === "image";

  const cardBody = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-stone-200 to-stone-100">
        {cover && isImage ? (
          <Image
            src={cover}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            loading="lazy"
            unoptimized={cover.startsWith("http")}
          />
        ) : cover && post.media_type === "video" ? (
          <video
            src={cover}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
            poster={BLUR_PLACEHOLDER}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-[#C5A059]/80">
            Viñales
          </div>
        )}

        {isRedirect && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            <Instagram className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Ver en Instagram</span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <h3
          className="font-serif text-lg md:text-xl font-bold leading-snug tracking-tight text-[#0A0A0A] line-clamp-2 group-hover:text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {title}
        </h3>
      </div>
    </>
  );

  const shellClass =
    `group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] ${className}`.trim();

  if (useExternal) {
    return (
      <article className="h-full">
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={shellClass}
          aria-label={`${title} — abrir en Instagram (se abre en pestaña nueva)`}
        >
          {cardBody}
        </a>
      </article>
    );
  }

  return (
    <article className="h-full">
      <Link href={`/descubre/${post.slug}`} className={shellClass}>
        {cardBody}
      </Link>
    </article>
  );
}
