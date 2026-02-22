
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Deshabilitar la verificación estricta de React para compatibilidad con ciertas librerías UI si es necesario
  reactStrictMode: true,
};

module.exports = nextConfig;
