import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import SessionManager from "../components/SessionManager";

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

export const metadata: Metadata = {
  title: "Meridian Luxury Travel - Luxury South American Adventures",
  description: "Discover South America with expertly crafted travel experiences. Luxury tours to Machu Picchu, Amazon rainforest, and more. Request your custom quote today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
          <Navigation />
          {children}
          <Footer />
          <SessionManager timeout={30} warningTime={2} />
        </AuthProvider>
      </body>
    </html>
  );
}
