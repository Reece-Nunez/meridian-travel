import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Custom Quote",
  description: "Request a personalized travel quote for your dream South American adventure. Our experts will craft a bespoke itinerary tailored to your preferences and budget.",
  openGraph: {
    title: "Request a Custom Quote | Meridian Luxury Travel",
    description: "Request a personalized travel quote for your dream South American adventure. Our experts will craft a bespoke itinerary tailored to you.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.webp"],
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
