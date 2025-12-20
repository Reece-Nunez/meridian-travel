export default function StructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meridianluxurytravel.com';

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${siteUrl}/#organization`,
    name: "Meridian Luxury Travel",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: "https://meridian-travel.s3.us-east-1.amazonaws.com/logo.png",
      width: 300,
      height: 60,
    },
    image: "https://meridian-travel.s3.us-east-1.amazonaws.com/og-image.png",
    description: "Meridian Luxury Travel specializes in expertly crafted luxury travel experiences across South America, including Peru, Argentina, Brazil, Chile, Ecuador, Galapagos Islands, and Antarctica.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Spanish"],
    },
    sameAs: [],
    priceRange: "$$$",
    areaServed: [
      {
        "@type": "Country",
        name: "Peru",
      },
      {
        "@type": "Country",
        name: "Argentina",
      },
      {
        "@type": "Country",
        name: "Brazil",
      },
      {
        "@type": "Country",
        name: "Chile",
      },
      {
        "@type": "Country",
        name: "Ecuador",
      },
      {
        "@type": "Place",
        name: "Galapagos Islands",
      },
      {
        "@type": "Place",
        name: "Antarctica",
      },
      {
        "@type": "Place",
        name: "Arctic",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Luxury Travel Packages",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Land Tours",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "TouristTrip",
                name: "Peru Tours",
                description: "Luxury tours to Machu Picchu, Sacred Valley, and Amazon rainforest",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "TouristTrip",
                name: "Argentina Tours",
                description: "Premium experiences in Buenos Aires, Patagonia, and Mendoza wine country",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Expedition Cruises",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "TouristTrip",
                name: "Galapagos Cruises",
                description: "Luxury expedition cruises through the Galapagos Islands",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "TouristTrip",
                name: "Antarctica Expeditions",
                description: "Luxury expedition cruises to Antarctica",
              },
            },
          ],
        },
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Meridian Luxury Travel",
    description: "Luxury South American travel experiences",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/packages?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}
