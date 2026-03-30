/**
 * Tour "Amanecer en Los Acuáticos..." — por título o slug (tolerando typos en URL).
 */
export function isAmanecerAcuaticosTour(slug: string, displayTitle: string): boolean {
  const s = slug.toLowerCase();
  const t = displayTitle.toLowerCase();
  if (t.includes("amanecer") && (t.includes("acuáticos") || t.includes("acuaticos"))) {
    return true;
  }
  if (!s.includes("amanecer")) return false;
  return (
    s.includes("acuaticos") ||
    s.includes("acuáticos") ||
    s.includes("acuticos") ||
    s.includes("acutico")
  );
}

/**
 * Tour "Escalada en Viñales, Cuba: conquista los mogotes..."
 */
export function isEscaladaVinalesTour(slug: string, displayTitle: string): boolean {
  const s = slug.toLowerCase();
  const t = displayTitle.toLowerCase();
  const tNorm = t.normalize("NFD").replace(/\p{M}/gu, "");
  if (tNorm.includes("escalada") && tNorm.includes("vinales")) {
    return true;
  }
  if (t.includes("escalada") && (t.includes("viñales") || t.includes("vinales"))) {
    return true;
  }
  if (t.includes("escalada") && t.includes("mogotes")) {
    return true;
  }
  if (!s.includes("escalada")) return false;
  return (
    s.includes("vinales") ||
    s.includes("viñales") ||
    s.includes("mogote") ||
    s.includes("mogotes")
  );
}

/**
 * Tour "Tu Ruta a caballo en Viñales: naturaleza, tabaco..."
 */
export function isRutaCaballoVinalesTour(slug: string, displayTitle: string): boolean {
  const s = slug.toLowerCase();
  const t = displayTitle.toLowerCase();
  const tNorm = t.normalize("NFD").replace(/\p{M}/gu, "");
  const sNorm = s.normalize("NFD").replace(/\p{M}/gu, "");
  const hasVinales = (x: string) => x.includes("vinales") || x.includes("viñales");
  if (tNorm.includes("caballo") && hasVinales(t)) {
    return true;
  }
  if (t.includes("tu ruta a caballo") || t.includes("ruta a caballo en viñales") || t.includes("ruta a caballo en vinales")) {
    return true;
  }
  if (sNorm.includes("caballo") && (hasVinales(s) || sNorm.includes("caballo-vinales"))) {
    return true;
  }
  return false;
}

/** Catálogo + detalle: overlay "Reservar experiencia" en estos tours concretos (solo PC vía clases en UI). */
export function showReservarExperienciaLabel(slug: string, displayTitle: string): boolean {
  return (
    isAmanecerAcuaticosTour(slug, displayTitle) ||
    isEscaladaVinalesTour(slug, displayTitle) ||
    isRutaCaballoVinalesTour(slug, displayTitle)
  );
}
