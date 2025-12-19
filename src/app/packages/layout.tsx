import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Travel Packages",
  description: "Explore our curated collection of luxury travel packages across South America. From Machu Picchu to Patagonia, discover expertly crafted adventures tailored to discerning travelers.",
  openGraph: {
    title: "Luxury Travel Packages | Meridian Luxury Travel",
    description: "Explore our curated collection of luxury travel packages across South America. From Machu Picchu to Patagonia, discover expertly crafted adventures.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/travel.webp"],
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
