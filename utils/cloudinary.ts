/**
 * Inyecta f_auto,q_auto en URLs de Cloudinary para formato y calidad automáticos.
 * Ejemplo: .../upload/v123/foto.jpg → .../upload/f_auto,q_auto/v123/foto.jpg
 * Si la URL no es de Cloudinary, se devuelve sin cambios.
 */
export function optimizeCloudinaryUrl(url: string): string {
  if (typeof url !== "string" || !url) return url;
  if (
    !url.includes("res.cloudinary.com") ||
    !url.includes("/image/upload/")
  ) {
    return url;
  }
  return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
}
