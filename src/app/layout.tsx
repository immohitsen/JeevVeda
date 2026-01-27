import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import "./globals.css";

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: {
    default: 'Jeev Veda',
    template: '%s | Jeev Veda',
  },
  description: 'Your comprehensive health companion.',
  metadataBase: new URL('https://jeevveda.com'), // Replace with your actual domain
  keywords: [
    'Jeev Veda',
    'AI health assistant',
    'personalized health insights',
    'digital health platform',
    'wellness management system',
    'symptom tracking tool',
    'cancer patient support platform',
    'medical analytics dashboard',
    'health monitoring application'
  ],
  openGraph: {
    title: 'Jeev Veda',
    description: 'Your comprehensive health companion.',
    url: 'https://jeevveda.com',
    siteName: 'Jeev Veda',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jeev Veda',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jeev Veda',
    description: 'Your comprehensive health companion.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
