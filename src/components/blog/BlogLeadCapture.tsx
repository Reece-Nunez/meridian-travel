'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { trackLead } from '@/lib/analytics';

/**
 * In-article lead magnet. Captures an email against /api/email-signup with a
 * 'blog' source so blog-driven leads are attributable in email_signups.
 * This is the primary "soft" conversion for readers not yet ready to request
 * a full quote.
 */
export default function BlogLeadCapture({
  heading = 'Get the free Antarctica & Galápagos planning guide',
  subheading = 'Seasons, ships, and real price ranges — straight to your inbox. No spam, unsubscribe anytime.',
}: {
  heading?: string;
  subheading?: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog' }),
      });
      if (!res.ok) throw new Error('Signup failed');
      trackLead('blog');
      setDone(true);
      toast.success("You're on the list — check your inbox soon.");
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="my-10 rounded-2xl border border-[#B8860B]/30 bg-[#FAF7EF] p-6 sm:p-8">
      <h3
        className="text-xl sm:text-2xl text-[#8B4513]"
        style={{ fontFamily: 'var(--font-serif), serif' }}
      >
        {heading}
      </h3>
      {done ? (
        <p className="mt-3 text-[#8B4513]">
          Thanks! We&apos;ll be in touch with your planning guide shortly.
        </p>
      ) : (
        <>
          <p className="mt-2 text-gray-600">{subheading}</p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-[#B8860B] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#B8860B] px-6 py-3 font-semibold text-white transition hover:bg-[#8B4513] disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send it to me'}
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
