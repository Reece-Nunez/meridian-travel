import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Expedition Cruises",
  description: "Discover luxury expedition cruises to the Galapagos Islands, Antarctica, Amazon, and Chilean Patagonia. Small-ship adventures with world-class amenities and expert naturalist guides.",
  openGraph: {
    title: "Luxury Expedition Cruises | Meridian Luxury Travel",
    description: "Discover luxury expedition cruises to the Galapagos Islands, Antarctica, Amazon, and Chilean Patagonia. Small-ship adventures with expert guides.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/galapagos-hero.webp"],
  },
};

export default function CruisesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
