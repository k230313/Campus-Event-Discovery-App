// ============================================
// File:    Login.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Displays the login form and routes authenticated users to the correct dashboard.
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { PageMeta } from '../components/PageMeta';

/**
 * Renders the login form used by students, organizers, and admins.
 * @returns {JSX.Element} Auth page with credential inputs and session error feedback.
 */
export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Asynchronously submits the login form and redirects the user to their role-specific dashboard.
   * @param {React.FormEvent} e - Form submit event from the login form.
   * @returns {Promise<void>} Resolves after authentication and navigation handling complete.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.user) {
        if (result.user.email.toLowerCase() === 'student@test.com') {
          toast('Hello human! You’ve entered the shared demo account. Account changes are locked for the showcase. Please be kind :((');
        }
        const destination = result.user.role === 'admin'
          ? '/admin-dashboard'
          : result.user.role === 'organizer'
          ? '/dashboard'
          : '/my-events';
        navigate(destination);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2E55] to-[#2a4575] flex items-center justify-center px-4 py-12">
      <PageMeta
        title="Login | Campus Event Discovery App"
        description="Log in to your Campus Event Discovery App account to manage registrations, organize events, and access role-specific dashboards."
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#EF9B28] text-white font-bold text-2xl px-4 py-2 rounded">
              KENT
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Log in to your CEDA account to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="text-[#1B2E55] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </>
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1B2E55] font-semibold hover:underline">
                Register here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
