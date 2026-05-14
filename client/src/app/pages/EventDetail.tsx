import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Bookmark, BookmarkCheck, Utensils, Armchair } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useApp } from '../context/AppContext';

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, user, isBookmarked, addBookmark, removeBookmark, addRSVP, hasRSVP } = useApp();
  const [attendeeType, setAttendeeType] = useState<'attendee' | 'volunteer'>('attendee');
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<number | undefined>();
  const [showRSVPForm, setShowRSVPForm] = useState(false);

  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Link to="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleRSVP = () => {
    if (!user) {
      alert('Please log in to RSVP');
      navigate('/login');
      return;
    }

    if (hasRSVP(event.id)) {
      alert('You have already RSVP\'d to this event');
      return;
    }

    const options: { foodOption?: string; seatNumber?: number } = {};

    if (event.foodProvided && selectedFood) {
      options.foodOption = selectedFood;
    }

    if (event.seatingCapacity && selectedSeat) {
      options.seatNumber = selectedSeat;
    }

    addRSVP(event.id, attendeeType, options);
    navigate('/registration-confirmation', {
      state: {
        eventTitle: event.title,
        attendeeType: attendeeType,
      },
    });
  };

  const handleBookmarkToggle = () => {
    if (!user) {
      alert('Please log in to bookmark events');
      navigate('/login');
      return;
    }
    if (isBookmarked(event.id)) {
      removeBookmark(event.id);
    } else {
      addBookmark(event.id);
    }
  };

  const availableSeats = (event.seatingCapacity || 0) - (event.seatsBooked || 0);
  const availableVolunteerSpots = (event.volunteersNeeded || 0) - (event.volunteersRegistered || 0);

  // Check if event is in the past
  const eventDate = new Date(event.date);
  const today = new Date('2026-05-06');
  const isEventPast = eventDate < today;

  // Check if event is at full capacity
  const isFullCapacity = event.seatingCapacity ? availableSeats <= 0 : false;

  // Check if registration is closed
  const isRegistrationClosed = isEventPast || (event.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9]">
      <div className="container mx-auto px-4 py-8">
        <Link to="/events">
          <Button variant="ghost" className="mb-6 hover:bg-[#1B2E55]/10 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl border-2">
              <div className="relative h-[28rem] overflow-hidden bg-gray-100">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="image-fallback absolute inset-0 bg-gradient-to-br from-[#1B2E55] to-[#2a4575] flex items-center justify-center"
                  style={{ display: event.image ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <Calendar className="h-24 w-24 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No Image Available</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBookmarkToggle}
                    className="bg-white/95 hover:bg-white shadow-xl backdrop-blur-sm h-12 w-12 transition-all duration-300 hover:scale-110"
                  >
                    {isBookmarked(event.id) ? (
                      <BookmarkCheck className="h-6 w-6 text-[#EF9B28]" />
                    ) : (
                      <Bookmark className="h-6 w-6 text-gray-600" />
                    )}
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#EF9B28] text-white border-0 shadow-lg">{event.category}</Badge>
                    {isEventPast && (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-0 shadow-lg">
                        Past Event
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{event.title}</h1>
                  <p className="text-white/90 text-lg drop-shadow-md">Organised by {event.organizerName}</p>
                </div>
              </div>

              <CardHeader className="bg-gradient-to-b from-gray-50 to-white border-b">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1B2E55] flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</p>
                      <p className="font-semibold text-[#1B2E55]">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EF9B28] flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
                      <p className="font-semibold text-[#1B2E55]">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1B2E55] flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                      <p className="font-semibold text-[#1B2E55]">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EF9B28] flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">RSVPs</p>
                      <p className="font-semibold text-[#1B2E55]">{event.rsvpCount} attending</p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 p-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-[#1B2E55] flex items-center gap-2">
                    <span className="w-1 h-8 bg-[#EF9B28] rounded-full"></span>
                    About This Event
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {event.description}
                  </p>
                </div>

                {event.foodProvided && event.foodOptions && (
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                        <Utensils className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-green-900">Food & Refreshments</h3>
                    </div>
                    <ul className="space-y-2">
                      {event.foodOptions.map((option, index) => (
                        <li key={index} className="flex items-center gap-2 text-green-800">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          <span className="font-medium">{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.seatingCapacity && (
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                        <Armchair className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-amber-900">Seating Information</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="bg-amber-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-amber-600 h-full transition-all duration-500"
                            style={{ width: `${((event.seatsBooked || 0) / event.seatingCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-900">{availableSeats}/{event.seatingCapacity}</p>
                        <p className="text-xs text-amber-700">available</p>
                      </div>
                    </div>
                  </div>
                )}

                {event.notes && (
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-xl">ℹ️</span>
                      </div>
                      <h3 className="font-bold text-lg text-blue-900">Important Notes</h3>
                    </div>
                    <p className="text-blue-800 leading-relaxed">{event.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Stats */}
            <Card className="shadow-lg border-2 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="border-b bg-gradient-to-r from-[#1B2E55] to-[#2a4575] text-white">
                <CardTitle className="text-lg">Event Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">👁️ Views</span>
                  <span className="font-bold text-xl text-blue-900">{event.viewCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">✓ RSVPs</span>
                  <span className="font-bold text-xl text-green-900">{event.rsvpCount}</span>
                </div>
                {event.volunteersNeeded && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-900">🙋 Volunteers</span>
                    <span className="font-bold text-xl text-purple-900">
                      {event.volunteersRegistered || 0}/{event.volunteersNeeded}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RSVP Card */}
            {isRegistrationClosed ? (
              <Card className="shadow-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="bg-red-500 text-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-2xl text-red-900 mb-2">
                      {event.status === 'cancelled' ? 'Event Cancelled' : 'Registration Closed'}
                    </h3>
                    <p className="text-red-700">
                      {event.status === 'cancelled'
                        ? 'This event has been cancelled by the organizer'
                        : 'This event has already taken place'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : isFullCapacity ? (
              <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="bg-amber-500 text-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-2xl text-amber-900 mb-2">Event Full</h3>
                    <p className="text-amber-700 mb-4">
                      This event has reached maximum capacity
                    </p>
                    <p className="text-sm text-amber-600">
                      Contact the organizer for waitlist information
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : !hasRSVP(event.id) ? (
              <Card className="shadow-xl border-2 border-[#EF9B28]/20 bg-gradient-to-br from-white to-orange-50/30">
                <CardHeader className="border-b bg-gradient-to-r from-[#EF9B28] to-[#d68a20] text-white">
                  <CardTitle className="text-lg">🎟️ Attend This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {!showRSVPForm ? (
                    <Button
                      onClick={() => setShowRSVPForm(true)}
                      className="w-full h-12 bg-gradient-to-r from-[#EF9B28] to-[#d68a20] hover:from-[#d68a20] hover:to-[#EF9B28] text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      RSVP Now
                    </Button>
                  ) : (
                    <>
                      <div>
                        <Label className="mb-2 block">I want to:</Label>
                        <RadioGroup value={attendeeType} onValueChange={(value) => setAttendeeType(value as 'attendee' | 'volunteer')}>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="attendee" id="attendee" />
                            <Label htmlFor="attendee">Attend as participant</Label>
                          </div>
                          {event.volunteersNeeded && availableVolunteerSpots > 0 && (
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="volunteer" id="volunteer" />
                              <Label htmlFor="volunteer">
                                Volunteer ({availableVolunteerSpots} spots left)
                              </Label>
                            </div>
                          )}
                        </RadioGroup>
                      </div>

                      {event.foodProvided && event.foodOptions && (
                        <div>
                          <Label className="mb-2 block">Food Preference</Label>
                          <Select value={selectedFood} onValueChange={setSelectedFood}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select food option" />
                            </SelectTrigger>
                            <SelectContent>
                              {event.foodOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {event.seatingCapacity && availableSeats > 0 && (
                        <div>
                          <Label className="mb-2 block">Seat Number (Optional)</Label>
                          <Select value={selectedSeat?.toString()} onValueChange={(value) => setSelectedSeat(Number(value))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seat" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: Math.min(availableSeats, 20) }, (_, i) => {
                                const seatNum = (event.seatsBooked || 0) + i + 1;
                                return (
                                  <SelectItem key={seatNum} value={seatNum.toString()}>
                                    Seat {seatNum}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleRSVP}
                          className="flex-1 bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white"
                        >
                          Confirm RSVP
                        </Button>
                        <Button
                          onClick={() => setShowRSVPForm(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 inline-block mb-4 shadow-lg">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-2xl text-green-900 mb-2">You're Registered! 🎉</h3>
                    <p className="text-green-700">
                      We'll see you at the event
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Volunteer Opportunity */}
            {event.volunteersNeeded && availableVolunteerSpots > 0 && !hasRSVP(event.id) && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                <CardHeader className="border-b bg-blue-100">
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <span className="text-xl">🙋</span>
                    Volunteer Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-blue-800 leading-relaxed">
                    This event needs <span className="font-bold">{availableVolunteerSpots} more volunteer{availableVolunteerSpots !== 1 ? 's' : ''}</span>.
                    Get involved and gain valuable experience!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

