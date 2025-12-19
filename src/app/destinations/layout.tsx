import { Metadata } from "next";

export const metadata: Metadata = {
  title: "South American Destinations",
  description: "Explore breathtaking destinations across South America. From the ancient wonders of Peru to the pristine wilderness of Antarctica, discover your next luxury adventure.",
  openGraph: {
    title: "South American Destinations | Meridian Luxury Travel",
    description: "Explore breathtaking destinations across South America. From the ancient wonders of Peru to the pristine wilderness of Antarctica.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/destinations.webp"],
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
