import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'SV Freshmart — Bangalore Farm Fresh Daily Groceries',
  description: 'Order farm-fresh vegetables, organic fruits, Nandini dairy, and daily essentials across Bangalore with guaranteed morning delivery.',
  keywords: ['Bangalore grocery', 'fresh vegetables Bangalore', 'farm fresh fruits', 'Nandini milk delivery', 'SV Freshmart', 'same day grocery Bangalore'],
  authors: [{ name: 'SV Freshmart Bangalore' }],
  metadataBase: new URL('https://svfreshmart.com'),
  openGraph: {
    title: 'SV Freshmart — Bangalore Farm Fresh Daily Groceries',
    description: 'Fresh farm harvest delivered to Bangalore doorsteps daily.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'SV Freshmart',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#047857',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
