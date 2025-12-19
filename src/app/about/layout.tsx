import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Meridian Luxury Travel, your trusted partner for luxury South American adventures. Our expert team crafts unforgettable journeys tailored to your dreams.",
  openGraph: {
    title: "About Us | Meridian Luxury Travel",
    description: "Learn about Meridian Luxury Travel, your trusted partner for luxury South American adventures.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.webp"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
