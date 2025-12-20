import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Meridian Luxury Travel. Our travel specialists are ready to help you plan your perfect South American adventure. Request a custom quote today.",
  openGraph: {
    title: "Contact Us | Meridian Luxury Travel",
    description: "Get in touch with Meridian Luxury Travel. Our travel specialists are ready to help you plan your perfect South American adventure.",
    images: ["https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.png"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
