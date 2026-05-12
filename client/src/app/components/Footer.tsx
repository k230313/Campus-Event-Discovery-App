import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1B2E55] text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Logo className="h-12 w-auto mb-4 brightness-0 invert" />
            <p className="text-white/70 text-sm leading-relaxed">
              Your centralized platform for discovering and managing all Kent Institute campus events.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-white/70 hover:text-[#EF9B28] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#EF9B28] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#EF9B28] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-[#EF9B28] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
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
                <Link to="/about" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-white/70 hover:text-[#EF9B28] transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 text-sm">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Kent Institute<br />Sydney, Australia</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>info@ceda.edu.au</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>+61 2 1234 5678</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              Copyright © 2026 Campus Event Discovery App. All rights reserved.
            </p>
            <p className="text-white/60 text-sm">
              Built with ❤️ at Kent Institute
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

