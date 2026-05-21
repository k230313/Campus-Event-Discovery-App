// ============================================
// File:    RegistrationConfirmation.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Registration Confirmation page for the frontend application.
// ============================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Home, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useEffect } from 'react';

/**
 * Renders the RegistrationConfirmation component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function RegistrationConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const eventTitle = location.state?.eventTitle || 'the event';
  const attendeeType = location.state?.attendeeType || 'attendee';
  const confirmationEmailStatus = location.state?.confirmationEmailStatus === 'sent' ? 'sent' : 'failed';
  const registrationStatus = location.state?.registrationStatus === 'waitlisted' ? 'waitlisted' : 'registered';

  useEffect(() => {
    // Redirect to events if no state is passed
    if (!location.state) {
      setTimeout(() => navigate('/events'), 2000);
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="border-2 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {registrationStatus === 'waitlisted' ? 'Waitlist Joined!' : 'Registration Successful!'}
            </h1>
            <p className="text-green-50 text-lg">
              {registrationStatus === 'waitlisted' ? 'Your place in line has been saved' : "You're all set for the event"}
            </p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="bg-[#F0F3F9] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#1B2E55] mb-4">What Happens Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EF9B28] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2E55]">Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      {registrationStatus === 'waitlisted'
                        ? 'You have been added to the waitlist. No confirmation email is sent for waitlist entries right now.'
                        : confirmationEmailStatus === 'sent'
                        ? 'We sent a confirmation email with the event details to your registered email address.'
                        : 'Your booking is confirmed, but we could not send the confirmation email right now.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EF9B28] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2E55]">Manage Registration</p>
                    <p className="text-sm text-muted-foreground">
                      {registrationStatus === 'waitlisted'
                        ? 'You can review or cancel your waitlist entry at any time from My Events in your dashboard'
                        : 'You can review this booking at any time from My Events in your dashboard'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EF9B28] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2E55]">Check Your Dashboard</p>
                    <p className="text-sm text-muted-foreground">
                      View all your registered events in your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800">
                    <strong>Registered as:</strong> {attendeeType === 'volunteer' ? '🙋 Volunteer' : '👤 Attendee'}
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Event:</strong> {eventTitle}
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Status:</strong> {registrationStatus === 'waitlisted' ? 'Waitlisted' : 'Registered'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/my-events" className="flex-1">
                <Button className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90">
                  <User className="mr-2 h-5 w-5" />
                  View My Events
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need to make changes?{' '}
                <Link to="/my-events" className="text-[#EF9B28] font-semibold hover:underline">
                  Manage your registrations
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
