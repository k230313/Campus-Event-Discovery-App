// ============================================
// File:    NotFound.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Not Found page for the frontend application.
// ============================================

import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

/**
 * Renders the NotFound component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#1B2E55] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[#1B2E55] mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="outline">
              <Search className="mr-2 h-5 w-5" />
              Browse Events
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-12">
          <img
            src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400&h=300&fit=crop"
            alt="404 illustration"
            className="mx-auto rounded-lg opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
