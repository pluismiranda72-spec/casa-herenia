/**
 * Contenido para la página "Tu Reserva Segura" (Trust & Security).
 * Estándares europeos, mensaje de confianza para viajeros.
 */

export const reservaSeguraContent = {
  title: "Tu Reserva Segura",
  
  intro:
    "En Casa Herenia y Pedro queremos que reserves con total tranquilidad. Combinamos la calidez de la hospitalidad cubana con los estándares de seguridad y confianza que esperan nuestros visitantes.",

  sections: [
    {
      heading: "Pago seguro y protegido",
      body: "Tu reserva se procesa a través de pasarelas de pago reconocidas internacionalmente. Los datos de tu tarjeta están protegidos con los más altos estándares de cifrado.",
    },
    {
      heading: "Opiniones verificadas",
      body: "Nuestro ranking en TripAdvisor y las opiniones de huéspedes reales te permiten conocer la experiencia de otros viajeros antes de reservar.",
    },
    {
      heading: "Compromiso con tu tranquilidad",
      body: "Política de cancelación clara, comunicación directa y un equipo que te acompaña desde la reserva hasta tu llegada al Valle de Viñales.",
    },
  ],

  /** Los 6 puntos de confianza (iconos: Shield, CreditCard, CheckCircle, User, Award, Heart) */
  trustPoints: [
    {
      icon: "Shield",
      title: "Reserva protegida",
      text: "Tu pago y datos están seguros con tecnología de cifrado.",
    },
    {
      icon: "CreditCard",
      title: "Pago con Stripe",
      text: "Pagos con tarjeta a través de Stripe.",
    },
    {
      icon: "CheckCircle",
      title: "Confirmación inmediata",
      text: "Recibe tu confirmación al instante por email.",
    },
    {
      icon: "User",
      title: "Atención personalizada",
      text: "Contacto directo para cualquier duda antes de reservar y durante toda tu estancia.",
    },
    {
      icon: "Award",
      title: "Reconocidos en TripAdvisor",
      text: "N.º 1 de hostales en Viñales según opiniones de viajeros.",
    },
    {
      icon: "Heart",
      title: "Compromiso con Cuba",
      text: "Hospitalidad auténtica y trato familiar en cada detalle.",
    },
  ],

  ctaTitle: "Reserva con confianza",
  ctaSubtext: "Elige fechas, estancia y completa tu reserva en pocos minutos.",
} as const;
