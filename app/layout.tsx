import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const SITE_URL = "https://www.casahereniaypedro.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Casa Herenia y Pedro | Lujo, Confort y Energía 24/7 en Viñales",
  description:
    "La mejor casa particular en Viñales, Cuba. A/C garantizado por paneles solares, desayuno incluido y pago en EUR. Reserva segura en el corazón del valle.",
  keywords: [
    "casa particular viñales",
    "alojamiento lujo cuba",
    "vinales tours",
    "bed and breakfast vinales",
    "aire acondicionado 24h cuba",
    "independent energy casa cuba",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Casa Herenia y Pedro | Tu refugio de lujo en Viñales",
    description:
      "Electricidad garantizada, confort total y la mejor atención en Cuba. ¡Reserva ahora!",
    url: SITE_URL,
    siteName: "Casa Herenia y Pedro",
    images: [
      {
        url: "/fondo.jpg",
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
    title: "Casa Herenia y Pedro | Tu refugio de lujo en Viñales",
    description:
      "Electricidad garantizada, confort total y la mejor atención en Cuba. ¡Reserva ahora!",
    images: ["/fondo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        {/* Preconnect to Stripe for instant checkout when user clicks RESERVAR */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://m.stripe.network" />
      </head>
      <body className="min-h-screen">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Metricool Tracking Script */}
        <Script id="metricool-tracker" strategy="afterInteractive">
          {`
            function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"fdf28228ce793eceee86fa3eebe82ee3"})});
          `}
        </Script>
      </body>
    </html>
  );
}
