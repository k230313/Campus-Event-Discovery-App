import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to request password reset');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password request failed:', error);
      alert('Failed to request a password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2E55] to-[#2a4575] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {!isSuccess ? (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#EF9B28] text-white font-bold text-2xl px-4 py-2 rounded">
                  KENT
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Forgot Password?</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@kent.edu.au"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
              <CardDescription className="text-center">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Link to="/login" className="w-full">
                <Button className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSuccess(false)}
              >
                Resend Email
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

