import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Esto permite cargar imágenes de Supabase y Airbnb
      },
    ],
  },
};

export default withNextIntl(nextConfig);