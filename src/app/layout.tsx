import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import ConditionalNavigation from "../components/ConditionalNavigation";
import ConditionalFooter from "../components/ConditionalFooter";
import { AuthProvider } from "../contexts/AuthContext";
import SessionManager from "../components/SessionManager";
import StructuredData from "../components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const leJourSerif = localFont({
  src: [
    {
      path: "../fonts/LeJourSerif.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/LeJourSerif.woff",
      weight: "400",
      style: "normal",
    }
  ],
  variable: "--font-le-jour-serif",
  display: "swap",
  fallback: ["serif"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxurytravel.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meridian Luxury Travel - Luxury South American Adventures",
    template: "%s | Meridian Luxury Travel",
  },
  description: "Discover South America with expertly crafted luxury travel experiences. Premium tours to Machu Picchu, Amazon rainforest, Galapagos Islands, Antarctica, and more. Request your custom quote today.",
  keywords: [
    "luxury travel",
    "South America tours",
    "Machu Picchu",
    "Amazon rainforest",
    "Galapagos Islands",
    "Antarctica cruises",
    "Peru travel",
    "Argentina tours",
    "Chile travel",
    "Brazil tours",
    "luxury cruises",
    "custom travel",
    "adventure travel",
    "expedition cruises",
  ],
  authors: [{ name: "Meridian Luxury Travel" }],
  creator: "Meridian Luxury Travel",
  publisher: "Meridian Luxury Travel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Meridian Luxury Travel",
    title: "Meridian Luxury Travel - Luxury South American Adventures",
    description: "Discover South America with expertly crafted luxury travel experiences. Premium tours to Machu Picchu, Amazon rainforest, Galapagos Islands, Antarctica, and more.",
    images: [
      {
        url: "https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Meridian Luxury Travel - Luxury South American Adventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian Luxury Travel - Luxury South American Adventures",
    description: "Discover South America with expertly crafted luxury travel experiences. Premium tours to Machu Picchu, Amazon rainforest, Galapagos Islands, and more.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "travel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${leJourSerif.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PQXF6QPH5Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PQXF6QPH5Y');
          `}
        </Script>
        <AuthProvider>
          <ConditionalNavigation />
          {children}
          <ConditionalFooter />
          <SessionManager timeout={30} warningTime={5} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
            }}
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
