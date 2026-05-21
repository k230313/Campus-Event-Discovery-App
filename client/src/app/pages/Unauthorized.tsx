// ============================================
// File:    Unauthorized.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Unauthorized page for the frontend application.
// ============================================

import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

/**
 * Renders the Unauthorized component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function Unauthorized() {
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#1B2E55] mb-4">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {user
              ? "You don't have permission to access this page. This area is restricted to authorized users only."
              : "You need to be logged in to access this page. Please log in with an authorized account."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!user ? (
            <Link to="/login">
              <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                Log In
              </Button>
            </Link>
          ) : null}
          <Link to="/">
            <Button variant="outline">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Need access?</strong> Contact your administrator or IT support if you believe you should have access to this page.
          </p>
        </div>
      </div>
    </div>
  );
}
