// ============================================
// File:    Register.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Displays the account registration form with role selection and captcha verification.
// ============================================

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';
import { useTurnstileScript } from '../hooks/useTurnstileScript';

/**
 * Renders the account registration form with role selection and captcha verification.
 * @returns {JSX.Element} Registration page for new student and organizer accounts.
 */
export function Register() {
  const TURNSTILE_SITE_KEY = '0x4AAAAAADN5Ecy-ORG9dtgF';
  const navigate = useNavigate();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const { isReady: isTurnstileReady, loadError: turnstileLoadError } = useTurnstileScript();

  useEffect(() => {
    /**
     * Renders the Cloudflare Turnstile widget once the external script is available.
     * @returns {void} Does not return a value.
     */
    const maybeRenderWidget = () => {
      const turnstile = (window as any).turnstile;

      if (!turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) {
        return;
      }

      turnstileWidgetIdRef.current = turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        /**
         * Stores the token returned by a successful captcha challenge.
         * @param {string} token - Verified Turnstile token issued by Cloudflare.
         * @returns {void} Does not return a value.
         */
        callback: (token: string) => {
          setTurnstileToken(token);
          setError('');
        },
        'expired-callback': () => {
          setTurnstileToken('');
        },
        'error-callback': () => {
          setTurnstileToken('');
          setError('Captcha verification failed. Please try again.');
        },
      });
    };

    if (isTurnstileReady) {
      maybeRenderWidget();
    }

    return () => {
      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetIdRef.current !== null) {
        turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileReady]);

  /**
   * Asynchronously submits the registration form after client-side validation succeeds.
   * @param {React.FormEvent} e - Form submit event from the registration form.
   * @returns {Promise<void>} Resolves after registration handling and UI updates complete.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the captcha challenge');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(name, email, password, role, turnstileToken);
      if (result.message) {
        setSuccess(result.message);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('student');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        const turnstile = (window as any).turnstile;
        if (turnstile && turnstileWidgetIdRef.current !== null) {
          turnstile.reset(turnstileWidgetIdRef.current);
        }
        setTurnstileToken('');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2E55] to-[#2a4575] flex items-center justify-center px-4 py-12">
      <PageMeta
        title="Register | Campus Event Discovery App"
        description="Create a Campus Event Discovery App account to browse events, bookmark opportunities, and manage organizer workflows at Kent Institute."
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#EF9B28] text-white font-bold text-2xl px-4 py-2 rounded">
              KENT
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join the Kent Institute campus community
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {turnstileLoadError && !error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{turnstileLoadError}</p>
              </div>
            ) : null}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@student.kent.edu.au"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>I am a:</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'student' | 'organizer')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="font-normal cursor-pointer">
                    Student - I want to discover and attend events
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="organizer" id="organizer" />
                  <Label htmlFor="organizer" className="font-normal cursor-pointer">
                    Organizer - I want to create and manage events
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Verification</Label>
              <div ref={turnstileContainerRef} className="min-h-16" />
              {!isTurnstileReady && !turnstileLoadError ? (
                <p className="text-sm text-muted-foreground">Loading captcha...</p>
              ) : null}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                'Creating account...'
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1B2E55] font-semibold hover:underline">
                Log in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
