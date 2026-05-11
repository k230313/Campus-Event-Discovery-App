import { Link } from 'react-router';
import { Calendar, Users, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { mockEvents } from '../data/mockEvents';

export function Home() {
  const upcomingEvents = mockEvents.slice(0, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#182E55] to-[#182E55]/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-[#EEA928] text-[#182E55] rounded-full mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Campus Event Discovery
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl text-white mb-6 leading-tight">
              Discover Events at Kent Institute Australia
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Connect with your campus community through exciting events, workshops, and networking opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#EEA928] text-[#182E55] rounded-lg hover:bg-[#EEA928]/90 transition"
              >
                Browse Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-lg hover:bg-white/20 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#182E55]/10 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-[#182E55]" />
              </div>
              <div className="text-3xl mb-2">{mockEvents.length}+</div>
              <p className="text-muted-foreground">Active Events</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#182E55]/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-[#182E55]" />
              </div>
              <div className="text-3xl mb-2">500+</div>
              <p className="text-muted-foreground">Students Engaged</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#182E55]/10 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-[#182E55]" />
              </div>
              <div className="text-3xl mb-2">6</div>
              <p className="text-muted-foreground">Event Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="mb-4">Why Use Campus Event Discovery?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to stay connected with campus life in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="w-12 h-12 bg-[#182E55] rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">Easy Discovery</h3>
            <p className="text-muted-foreground text-sm">
              Find events that match your interests with powerful search and filtering options.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="w-12 h-12 bg-[#182E55] rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">Stay Organized</h3>
            <p className="text-muted-foreground text-sm">
              Bookmark events and keep track of all your upcoming activities in one dashboard.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="w-12 h-12 bg-[#182E55] rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="mb-2">Connect & Network</h3>
            <p className="text-muted-foreground text-sm">
              Join workshops, career fairs, and social events to build your professional network.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these exciting opportunities</p>
            </div>
            <Link
              to="/events"
              className="hidden sm:flex items-center gap-2 text-[#182E55] hover:text-[#EEA928] transition"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-sm border border-border hover:shadow-md hover:border-[#182E55]/30 transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-center bg-[#182E55] text-white rounded-lg p-3 min-w-[60px]">
                      <div className="text-xs opacity-80">
                        {formatDate(event.date).split(' ')[1]}
                      </div>
                      <div className="text-2xl">
                        {formatDate(event.date).split(' ')[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.rsvpCount}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {event.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center sm:hidden">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[#182E55] hover:text-[#EEA928] transition"
            >
              View All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#182E55] to-[#182E55]/90 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/90 mb-8 text-lg">
            Join the Kent community and never miss an event again
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#EEA928] text-[#182E55] rounded-lg hover:bg-[#EEA928]/90 transition"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-lg hover:bg-white/20 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
