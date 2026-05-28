// ============================================
// File:    Footer.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Footer frontend component.
// ============================================

import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const externalLinkClassName =
  'text-white/85 hover:text-[#EF9B28] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm';
const footerLinkClassName =
  'text-white/85 hover:text-[#EF9B28] transition-colors text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-sm';

/**
 * Renders the Footer component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function Footer() {
  return (
    <footer className="bg-[#1B2E55] text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Logo className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-white/85 text-base leading-relaxed">
              Your centralized platform for discovering and managing all Kent Institute campus events.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://x.com/kent_institute"
                target="_blank"
                rel="noreferrer"
                aria-label="Kent Institute X opens in new tab"
                className={externalLinkClassName}
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">opens in new tab</span>
              </a>
              <a
                href="https://www.instagram.com/kent_institute/"
                target="_blank"
                rel="noreferrer"
                aria-label="Kent Institute Instagram opens in new tab"
                className={externalLinkClassName}
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">opens in new tab</span>
              </a>
              <a
                href="https://www.linkedin.com/school/kentinstituteaustralia/"
                target="_blank"
                rel="noreferrer"
                aria-label="Kent Institute LinkedIn opens in new tab"
                className={externalLinkClassName}
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">opens in new tab</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={footerLinkClassName}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className={footerLinkClassName}>
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={footerLinkClassName}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-event" className={footerLinkClassName}>
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={footerLinkClassName}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={footerLinkClassName}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={footerLinkClassName}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className={footerLinkClassName}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className={footerLinkClassName}>
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/85 text-base">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Kent Institute<br />Sydney, Australia</span>
              </li>
              <li className="flex items-center gap-2 text-white/85 text-base">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@ceda.edu.au</span>
              </li>
              <li className="flex items-center gap-2 text-white/85 text-base">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+61 2 1234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/75 text-base">
              Copyright (c) 2026 Campus Event Discovery App. All rights reserved.
            </p>
            <p className="text-white/75 text-base">
              Built at Kent Institute
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
