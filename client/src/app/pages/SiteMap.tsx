// ============================================
// File:    SiteMap.tsx
// Author:  OpenAI Codex
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders a public sitemap page with links to key areas of the site.
// ============================================

import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';

const sitemapSections = [
  {
    heading: 'Explore',
    links: [
      { to: '/', label: 'Home', description: 'Overview of the platform and featured calls to action.' },
      { to: '/events', label: 'Browse Events', description: 'Search and filter upcoming and past campus events.' },
      { to: '/about', label: 'About Us', description: 'Learn what CEDA does and why it exists.' },
      { to: '/contact', label: 'Contact Us', description: 'Send a message or find campus contact details.' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { to: '/login', label: 'Login', description: 'Sign in to student, organizer, or admin accounts.' },
      { to: '/register', label: 'Register', description: 'Create a student or organizer account.' },
      { to: '/forgot-password', label: 'Forgot Password', description: 'Start a password reset for an existing account.' },
      { to: '/verify-email', label: 'Verify Email', description: 'Complete email verification for a new account.' },
    ],
  },
  {
    heading: 'Policies',
    links: [
      { to: '/privacy-policy', label: 'Privacy Policy', description: 'Review how account and event data is handled.' },
      { to: '/terms-conditions', label: 'Terms & Conditions', description: 'Read the platform terms of use.' },
    ],
  },
];

/**
 * Renders a public sitemap page to improve discoverability for users and crawlers.
 * @returns {JSX.Element} Link index for key public routes.
 */
export function SiteMap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <PageMeta
        title="Sitemap | Campus Event Discovery App"
        description="Browse the key public pages of the Campus Event Discovery App, including events, account access, contact details, and policies."
      />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-3">Sitemap</h1>
            <p className="text-lg text-slate-700 max-w-3xl">
              Use this page to jump directly to the main public areas of CEDA. It also helps search engines and assistive technology users discover important content quickly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sitemapSections.map((section) => (
              <section key={section.heading} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-[#1B2E55] mb-4">{section.heading}</h2>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-lg font-medium text-[#1B2E55] hover:text-[#EF9B28] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2E55] rounded-sm"
                      >
                        {link.label}
                      </Link>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{link.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
