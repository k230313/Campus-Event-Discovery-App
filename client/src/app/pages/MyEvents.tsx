// ============================================
// File:    MyEvents.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the My Events page for the frontend application.
// ============================================

import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, MapPin, Users, Ticket, User, UserMinus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * Renders the MyEvents component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function MyEvents() {
  const { user, events, rsvps, removeRSVP } = useApp();
  const [unregisteringEventId, setUnregisteringEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const myRSVPs = rsvps.filter((rsvp) => rsvp.userId === user.id);
  const myEvents = events.filter((event) =>
    myRSVPs.some((rsvp) => rsvp.eventId === event.id)
  );

  /**
   * Asynchronously executes the get rsvpdetails logic.
   * @param {*} eventId - Represents the eventId input.
   * @returns {*} Returns the resulting value.
   */
  const getRSVPDetails = (eventId: string) => {
    return myRSVPs.find((rsvp) => rsvp.eventId === eventId);
  };

  /**
   * Asynchronously executes the handle unregister logic.
   * @param {*} eventId - Represents the eventId input.
   * @param {*} eventTitle - Represents the eventTitle input.
   * @returns {*} Returns the resulting value.
   */
  const handleUnregister = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to unregister from "${eventTitle}"?`)) {
      setUnregisteringEventId(eventId);
      removeRSVP(eventId);
      setTimeout(() => setUnregisteringEventId(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Ticket className="h-10 w-10 text-[#EF9B28]" />
              My Events
            </h1>
            <p className="text-muted-foreground">Events you've registered for</p>
            <p className="text-sm text-muted-foreground mt-1">Confirmed registrations and waitlist entries both appear here.</p>
          </div>

          {myEvents.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Ticket className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1B2E55] mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6">
                  Browse events and RSVP to start building your schedule
                </p>
                <Link to="/events">
                  <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90">
                    <Calendar className="mr-2 h-4 w-4" />
                    Browse Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myEvents.map((event) => {
                const rsvpDetails = getRSVPDetails(event.id);
                return (
                  <Card key={event.id} className="border-2 hover:border-[#EF9B28]/50 hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-4 gap-6">
                        {/* Event Image */}
                        {event.image && (
                          <div className="rounded-lg overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Event Details */}
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-3 mb-3">
                            <Badge>{event.category}</Badge>
                            {rsvpDetails?.status === 'waitlisted' && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500">
                                Waitlisted
                              </Badge>
                            )}
                            {rsvpDetails?.attendeeType === 'volunteer' && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                                Volunteering
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-xl text-[#1B2E55] mb-3">
                            {event.title}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(event.date).toLocaleDateString()} at {event.startTime} - {event.endTime}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              {event.rsvpCount} attending
                            </div>
                          </div>
                        </div>

                        {/* RSVP Details */}
                        <div className="space-y-3">
                          <div className="p-4 bg-[#F0F3F9] rounded-lg">
                            <h4 className="font-semibold text-sm text-[#1B2E55] mb-2">Your RSVP Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {rsvpDetails?.attendeeType === 'volunteer' ? 'Volunteer' : 'Attendee'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status: </span>
                                <span className="font-medium">
                                  {rsvpDetails?.status === 'waitlisted' ? 'Waitlisted' : 'Registered'}
                                </span>
                              </div>
                              {rsvpDetails?.selectedFoodOption && (
                                <div>
                                  <span className="text-muted-foreground">Food: </span>
                                  <span className="font-medium">{rsvpDetails.selectedFoodOption}</span>
                                </div>
                              )}
                              {rsvpDetails?.seatNumber && (
                                <div>
                                  <span className="text-muted-foreground">Seat: </span>
                                  <span className="font-medium">#{rsvpDetails.seatNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Link to={`/events/${event.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                              View Event
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleUnregister(event.id, event.title)}
                            disabled={unregisteringEventId === event.id}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            {unregisteringEventId === event.id ? 'Unregistering...' : 'Unregister'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
