import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casa Herenia y Pedro | Alojamiento Premium en Viñales | Reserva Segura",
  description:
    "Reserva tu casa particular en Viñales con total seguridad. Gestión europea, confirmación inmediata y vistas exclusivas al Valle. Pago 100% protegido.",
  keywords: [
    "alojamiento exclusivo Viñales",
    "casa particular premium Viñales",
    "reserva segura Viñales",
    "estancia Viñales pago tarjeta",
    "Casa Herenia y Pedro",
  ],
  openGraph: {
    title: "Casa Herenia y Pedro | Tu Refugio de Lujo en Viñales",
    description:
      "Descubre el lujo tranquilo en Cuba. Reserva directa con garantía europea, sin intermediarios y con confirmación inmediata.",
    url: "https://www.casahereniaypedro.com",
    siteName: "Casa Herenia y Pedro",
    images: [
      {
        url: "https://www.casahereniaypedro.com/fondo.jpg",
        width: 1200,
        height: 630,
        alt: "Vista panorámica del Valle de Viñales desde Casa Herenia y Pedro",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Casa Herenia y Pedro | Alojamiento Premium en Viñales",
    description:
      "Reserva directa con garantía europea. El lujo de sentirse en casa frente a los mogotes de Viñales.",
    images: ["https://www.casahereniaypedro.com/fondo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
