// ============================================
// File:    VerifyEmail.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Displays email verification progress and outcome for verification-link visits.
// ============================================

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, MailCheck, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { csrfFetch } from '../services/api';

/**
 * Renders the email verification page shown after a user opens a verification link.
 * @returns {JSX.Element} Verification status page with success or failure messaging.
 */
export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token') || '';

    if (!token) {
      setStatus('error');
      setMessage('Verification link is invalid or missing.');
      return;
    }

    /**
     * Asynchronously verifies the email token supplied in the URL query string.
     * @returns {Promise<void>} Resolves after the verification request updates the page state.
     */
    async function verifyEmail() {
      try {
        const response = await csrfFetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setStatus('error');
          setMessage(data?.error || 'Failed to verify email');
          return;
        }

        setStatus('success');
        setMessage(data?.message || 'Email verified successfully. You can now log in.');
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
        setMessage('Failed to verify email');
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2E55] to-[#2a4575] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#EF9B28] text-white font-bold text-2xl px-4 py-2 rounded">
              KENT
            </div>
          </div>
          <div className="flex items-center justify-center mb-2">
            {status === 'loading' ? (
              <div className="h-16 w-16 bg-[#EF9B28]/10 rounded-full flex items-center justify-center">
                <MailCheck className="h-10 w-10 text-[#EF9B28]" />
              </div>
            ) : status === 'success' ? (
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent />

        <CardFooter className="flex flex-col space-y-4">
          <Link to="/login" className="w-full">
            <Button className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
              Go to Login
            </Button>
          </Link>
          {status === 'error' && (
            <Link to="/register" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Registration
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
