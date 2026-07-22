/**
 * Thin, typed wrapper around GA4's gtag(). The gtag script + config live in
 * app/layout.tsx (measurement id G-PQXF6QPH5Y); this just gives the rest of the
 * app a safe way to fire events without sprinkling `window as any` everywhere.
 *
 * Why this exists: the GA4 property has key events configured (generate_lead,
 * qualify_lead, purchase, close_convert_lead) but nothing was ever firing them,
 * so every conversion read as 0. These helpers close that gap at the real
 * conversion moments. After deploying, mark the matching events as key events
 * in GA4 (Admin → Events → star icon).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, unknown>;

/** Fire a GA4 event. No-ops safely on the server or before gtag loads. */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/**
 * A new inquiry/lead. `context` distinguishes where it came from
 * (e.g. 'quote_form', 'blog') so lead sources are comparable in GA4.
 * Also fires qualify_lead, one of the property's configured key events.
 */
export function trackLead(context: string, params: EventParams = {}): void {
  trackEvent('generate_lead', { lead_source: context, ...params });
  trackEvent('qualify_lead', { lead_source: context, ...params });
}
