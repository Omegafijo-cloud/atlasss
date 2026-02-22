
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Asumiendo que moverás el CSS de tailwind aquí o se generará
import { ClientProviders } from '../components/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atlass - Buscador Inteligente',
  description: 'Base de conocimientos centralizada y soporte técnico.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
         <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-[var(--color-bg)] transition-colors duration-300 pb-20">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
