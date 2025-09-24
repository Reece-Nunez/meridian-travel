// Helper functions to parse quote details from special_requirements field

export interface ParsedGroupDetails {
  adults: number;
  children: number;
  rooms: number;
}

export function parseGroupDetails(specialRequirements: string | null): ParsedGroupDetails {
  const defaultResult = { adults: 0, children: 0, rooms: 1 };

  if (!specialRequirements) return defaultResult;

  try {
    // Look for patterns like "2 adults, 4 children (under 12), 1 room"
    // or "3 adults, 2 children under 12"

    const adultMatch = specialRequirements.match(/(\d+)\s+adults?/i);
    const childMatch = specialRequirements.match(/(\d+)\s+children?\s*(?:\(under\s+12\)|under\s+12)/i);
    const roomMatch = specialRequirements.match(/(\d+)\s+rooms?/i);

    const adults = adultMatch ? parseInt(adultMatch[1], 10) : 0;
    const children = childMatch ? parseInt(childMatch[1], 10) : 0;
    const rooms = roomMatch ? parseInt(roomMatch[1], 10) : 1;

    return {
      adults: adults || 0,
      children: children || 0,
      rooms: rooms || 1
    };
  } catch (error) {
    console.error('Error parsing group details:', error);
    return defaultResult;
  }
}

export function formatGroupDetails(adults: number, children: number, rooms: number): string {
  const parts = [];

  if (adults > 0) {
    parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
  }

  if (children > 0) {
    parts.push(`${children} child${children !== 1 ? 'ren' : ''} (under 12)`);
  }

  if (rooms > 0) {
    parts.push(`${rooms} room${rooms !== 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}