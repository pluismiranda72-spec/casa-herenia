"use client";

import { useState, useCallback } from "react";
import { Loader2, Newspaper, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { deletePost } from "@/app/actions/deletePost";

type PostAdminRow = {
  id: string;
  title: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string | null;
};

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastList({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`rounded-lg border px-4 py-3 shadow-lg font-sans text-sm ${
            t.type === "success"
              ? "border-green-500/50 bg-green-950/90 text-green-100"
              : "border-red-500/50 bg-red-950/90 text-red-100"
          }`}
        >
          {t.message}
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function DeletePostButton({
  id,
  onDeleted,
  addToast,
}: {
  id: string;
  onDeleted: () => void;
  addToast: (type: "success" | "error", message: string) => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    setPending(true);
    const result = await deletePost(id);
    setPending(false);

    if (result.success) {
      addToast("success", "Publicación eliminada correctamente.");
      setConfirming(false);
      onDeleted();
      router.refresh();
      return;
    }

    addToast("error", result.error);
  };

  return (
    <div className="relative">
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-lg border border-red-500/60 bg-transparent px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-3 h-3" aria-hidden />
          Eliminar
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-transparent px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700/20 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {pending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
            ) : null}
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

export default function PublicacionesAdminClient({
  initialPosts,
}: {
  initialPosts: PostAdminRow[];
}) {
  const [posts, setPosts] = useState<PostAdminRow[]>(initialPosts);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  const router = useRouter();

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    setToastId((prev) => {
      const id = prev + 1;
      setToasts((prevToasts) => [...prevToasts, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
      return id;
    });
  }, [removeToast]);

  const handleDeletedLocal = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    // router.refresh() lo hace el botón; esto es para feedback inmediato.
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-amber-400" aria-hidden />
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                Gestión de Publicaciones
              </h1>
              <p className="text-xs text-slate-400">
                Descubre Viñales · listar, editar y eliminar
              </p>
            </div>
          </div>

          <Link
            href="/admin/publicar"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/30 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800/50 transition-colors"
          >
            + Nueva publicación
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/70">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-amber-400 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" aria-hidden />
                Publicaciones actuales
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ordenadas por fecha de creación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/30 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              Refrescar
            </button>
          </div>

          {posts.length === 0 ? (
            <p className="text-sm text-slate-400">
              Todavía no hay publicaciones.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-800/40">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-semibold">Imagen</th>
                    <th className="py-3 px-4 font-semibold">Título</th>
                    <th className="py-3 px-4 font-semibold">Fecha</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {posts.map((post) => {
                    const canShowImage =
                      post.media_url && post.media_type === "image";
                    return (
                      <tr key={post.id} className="hover:bg-slate-800/20">
                        <td className="py-4 px-4">
                          {canShowImage ? (
                            <img
                              src={post.media_url as string}
                              alt={post.title ?? "Publicación"}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700/60 bg-slate-800/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-dashed border-slate-700/60 flex items-center justify-center text-[10px] text-slate-500">
                              Sin imagen
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-100 truncate max-w-[320px]">
                            {post.title || "Sin título"}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-slate-300">
                          {formatDate(post.created_at)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/editar-publicaciones/${post.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden />
                              Editar
                            </Link>

                            <DeletePostButton
                              id={post.id}
                              addToast={addToast}
                              onDeleted={() => handleDeletedLocal(post.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ToastList toasts={toasts} remove={removeToast} />
    </div>
  );
}

