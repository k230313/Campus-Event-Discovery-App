import { Link } from 'react-router';
import {
  Calendar,
  Users,
  Eye,
  Plus,
  Bookmark,
  TrendingUp,
  LayoutDashboard,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useRSVP } from '../context/RSVPContext';
import { mockEvents } from '../data/mockEvents';

export function Dashboard() {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const { rsvps } = useRSVP();

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Please sign in to view your dashboard</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Organiser's events (filtered by organiserId)
  const myEvents = mockEvents.filter((event) => event.organiserId === user.id);

  // Calculate stats for organiser
  const totalViews = myEvents.reduce((sum, event) => sum + event.viewCount, 0);
  const totalRsvps = myEvents.reduce((sum, event) => sum + event.rsvpCount, 0);
  const publishedEvents = myEvents.filter((event) => event.status === 'published').length;

  // Get bookmarked events for students
  const bookmarkedEvents = mockEvents.filter((event) => bookmarks.has(event.id));

  // Get RSVP'd events for students
  const rsvpedEvents = mockEvents.filter((event) =>
    rsvps.some((rsvp) => rsvp.eventId === event.id && rsvp.status === 'attending')
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-[#182E55] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <LayoutDashboard className="w-8 h-8" />
            <h1 className="text-white">Dashboard</h1>
          </div>
          <p className="text-white/80">Welcome back, {user.name}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'organiser' ? (
          // Organiser Dashboard
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <Link
                to="/dashboard/create-event"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EEA928] text-[#182E55] rounded-lg hover:bg-[#EEA928]/90 transition"
              >
                <Plus className="w-5 h-5" />
                Create New Event
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Total Events</h3>
                  <Calendar className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{publishedEvents}</div>
                <p className="text-xs text-muted-foreground">Published events</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Total Views</h3>
                  <Eye className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{totalViews}</div>
                <p className="text-xs text-muted-foreground">Across all events</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Total RSVPs</h3>
                  <Users className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{totalRsvps}</div>
                <p className="text-xs text-muted-foreground">Students registered</p>
              </div>
            </div>

            {/* My Events */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2>My Events</h2>
                <Link
                  to="/dashboard/create-event"
                  className="text-sm text-[#182E55] hover:text-[#EEA928] transition"
                >
                  Create Event
                </Link>
              </div>

              {myEvents.length > 0 ? (
                <div className="space-y-4">
                  {myEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block p-4 border border-border rounded-lg hover:border-[#182E55]/30 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-1">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(event.startTime)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Eye className="w-4 h-4" /> {event.viewCount} views
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="w-4 h-4" /> {event.rsvpCount} RSVPs
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full capitalize">
                          {event.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-muted-foreground mb-2">No events yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first event to get started
                  </p>
                  <Link
                    to="/dashboard/create-event"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          // Student Dashboard
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Bookmarked Events</h3>
                  <Bookmark className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{bookmarkedEvents.length}</div>
                <p className="text-xs text-muted-foreground">Saved for later</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">RSVP'd Events</h3>
                  <CheckCircle className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{rsvpedEvents.length}</div>
                <p className="text-xs text-muted-foreground">You're attending</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Total Events</h3>
                  <TrendingUp className="w-5 h-5 text-[#182E55]" />
                </div>
                <div className="text-3xl mb-1">{mockEvents.length}</div>
                <p className="text-xs text-muted-foreground">Available to join</p>
              </div>
            </div>

            {/* RSVP'd Events */}
            {rsvpedEvents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h2>Your RSVP'd Events</h2>
                  </div>
                  <Link
                    to="/events"
                    className="text-sm text-[#182E55] hover:text-[#EEA928] transition"
                  >
                    Find More Events
                  </Link>
                </div>

                <div className="space-y-4">
                  {rsvpedEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block p-4 border border-border rounded-lg hover:border-[#182E55]/30 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success fill-success/20" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmarked Events */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2>Bookmarked Events</h2>
                <Link
                  to="/events"
                  className="text-sm text-[#182E55] hover:text-[#EEA928] transition"
                >
                  Browse All Events
                </Link>
              </div>

              {bookmarkedEvents.length > 0 ? (
                <div className="space-y-4">
                  {bookmarkedEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-4 border border-border rounded-lg hover:border-[#182E55]/30 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="mb-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <Bookmark className="w-5 h-5 text-[#EEA928] fill-[#EEA928]" />
                    </div>
                  </Link>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-muted-foreground mb-2">No bookmarked events yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bookmark events to save them for later
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
                  >
                    Explore Events
                  </Link>
                </div>
              )}
            </div>

            {/* Discover More */}
            <div className="bg-gradient-to-r from-[#182E55] to-[#182E55]/90 rounded-lg p-8 text-white text-center">
              <h2 className="text-white mb-2">Discover More Events</h2>
              <p className="text-white/80 mb-6">
                Explore upcoming events and connect with the Kent community
              </p>
              <Link
                to="/events"
                className="inline-block px-6 py-3 bg-[#EEA928] text-[#182E55] rounded-md hover:bg-[#EEA928]/90 transition"
              >
                Browse Events
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
