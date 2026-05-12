import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Calendar, MapPin, Users, Bookmark, BookmarkCheck, Clock, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useApp } from '../context/AppContext';
import { EventCategory } from '../types';

export function Events() {
  const { events, isBookmarked, addBookmark, removeBookmark, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past' | 'this-week' | 'this-month'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading events
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;

      // Date filter
      const eventDate = new Date(event.date);
      const today = new Date('2026-05-06');
      const oneWeekFromNow = new Date(today);
      oneWeekFromNow.setDate(today.getDate() + 7);
      const oneMonthFromNow = new Date(today);
      oneMonthFromNow.setMonth(today.getMonth() + 1);

      let matchesDate = true;
      if (dateFilter === 'upcoming') {
        matchesDate = eventDate >= today;
      } else if (dateFilter === 'past') {
        matchesDate = eventDate < today;
      } else if (dateFilter === 'this-week') {
        matchesDate = eventDate >= today && eventDate <= oneWeekFromNow;
      } else if (dateFilter === 'this-month') {
        matchesDate = eventDate >= today && eventDate <= oneMonthFromNow;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [events, searchQuery, categoryFilter, dateFilter]);

  const handleBookmarkToggle = (eventId: string) => {
    if (!user) {
      alert('Please log in to bookmark events');
      return;
    }
    if (isBookmarked(eventId)) {
      removeBookmark(eventId);
    } else {
      addBookmark(eventId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: EventCategory) => {
    const colors = {
      Academic: 'bg-blue-100 text-blue-800',
      Social: 'bg-pink-100 text-pink-800',
      Career: 'bg-green-100 text-green-800',
      Club: 'bg-purple-100 text-purple-800',
      Workshop: 'bg-orange-100 text-orange-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F3F9] to-white">
      <div className="relative bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55] text-white py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#EF9B28]/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-bold mb-4">Browse Campus Events</h1>
          <p className="text-xl text-white/90">
            Discover workshops, networking opportunities, and social gatherings at Kent Institute
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-[#1B2E55] mb-2 block">Search Events</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search events by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 focus:border-[#EF9B28] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1B2E55] mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as EventCategory | 'All')}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Academic">📚 Academic</SelectItem>
                  <SelectItem value="Social">🎉 Social</SelectItem>
                  <SelectItem value="Career">💼 Career</SelectItem>
                  <SelectItem value="Club">🎯 Club</SelectItem>
                  <SelectItem value="Workshop">🛠️ Workshop</SelectItem>
                  <SelectItem value="Other">📌 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1B2E55] mb-2 block">Date Range</label>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
                <SelectTrigger className="h-12 border-2">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 All Dates</SelectItem>
                  <SelectItem value="upcoming">⏰ Upcoming Events</SelectItem>
                  <SelectItem value="past">⏮️ Past Events</SelectItem>
                  <SelectItem value="this-week">📆 This Week</SelectItem>
                  <SelectItem value="this-month">🗓️ This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <Badge variant="secondary" className="text-sm">
                Showing {filteredEvents.length} of {events.length} events
              </Badge>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-16 w-16 text-[#EF9B28] animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Event Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id} className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-[#EF9B28]/30 group">
              <div className="relative h-52 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                  onClick={() => handleBookmarkToggle(event.id)}
                >
                  {isBookmarked(event.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-[#EF9B28]" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-gray-600" />
                  )}
                </Button>
                <div className="absolute bottom-3 left-3 right-3">
                  <Badge className={`${getCategoryColor(event.category)} shadow-lg`}>
                    {event.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  {event.foodProvided && (
                    <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                      🍕 Food
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg leading-tight line-clamp-2 text-[#1B2E55] group-hover:text-[#EF9B28] transition-colors">
                  {event.title}
                </h3>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-[#1B2E55]/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-[#1B2E55]" />
                    </div>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-[#EF9B28]/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <Clock className="h-4 w-4 text-[#EF9B28]" />
                    </div>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-[#1B2E55]/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-[#1B2E55]" />
                    </div>
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-[#EF9B28]/10 flex items-center justify-center mr-3 flex-shrink-0">
                      <Users className="h-4 w-4 text-[#EF9B28]" />
                    </div>
                    <span className="font-semibold">{event.rsvpCount} RSVPs</span>
                  </div>
                </div>

                {event.volunteersNeeded && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">
                      🙋 Volunteers: {event.volunteersRegistered || 0}/{event.volunteersNeeded}
                    </p>
                  </div>
                )}

                {event.seatingCapacity && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900">
                      💺 Seats: {event.seatsBooked || 0}/{event.seatingCapacity}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <Link to={`/events/${event.id}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-[#EF9B28] to-[#d68a20] hover:from-[#d68a20] hover:to-[#EF9B28] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    View Details →
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Events Found</h3>
              <p className="text-lg text-muted-foreground mb-6">
                No events match your search criteria. Try adjusting your filters.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setDateFilter('all');
                }}
                variant="outline"
                className="border-2 border-[#EF9B28] text-[#EF9B28] hover:bg-[#EF9B28] hover:text-white"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
