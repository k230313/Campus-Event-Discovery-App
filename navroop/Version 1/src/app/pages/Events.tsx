import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Calendar, MapPin, Users, Search, Filter, Bookmark, UtensilsCrossed, HandHeart, Armchair } from 'lucide-react';
import { mockEvents } from '../data/mockEvents';
import { EventCategory } from '../types';
import { useBookmarks } from '../context/BookmarkContext';
import { useAuth } from '../context/AuthContext';

const categories: EventCategory[] = ['Academic', 'Social', 'Career', 'Club', 'Workshop', 'Other'];

export function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyWithFood, setShowOnlyWithFood] = useState(false);
  const [showOnlyVolunteering, setShowOnlyVolunteering] = useState(false);
  const [showOnlyAvailableSeats, setShowOnlyAvailableSeats] = useState(false);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const matchesSearch =
        searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesFood = !showOnlyWithFood || event.food?.provided;
      const matchesVolunteering = !showOnlyVolunteering || (event.volunteering?.needed && (event.volunteering.totalSpots || 0) > (event.volunteering.filledSpots || 0));
      const matchesSeats = !showOnlyAvailableSeats || (event.seating?.remaining && event.seating.remaining > 0);

      return matchesSearch && matchesCategory && matchesFood && matchesVolunteering && matchesSeats;
    });
  }, [searchQuery, selectedCategory, showOnlyWithFood, showOnlyVolunteering, showOnlyAvailableSeats]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
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

  const getCategoryColor = (category: EventCategory) => {
    const colors: Record<EventCategory, string> = {
      Academic: 'bg-blue-100 text-blue-700 border-blue-200',
      Social: 'bg-purple-100 text-purple-700 border-purple-200',
      Career: 'bg-green-100 text-green-700 border-green-200',
      Club: 'bg-orange-100 text-orange-700 border-orange-200',
      Workshop: 'bg-pink-100 text-pink-700 border-pink-200',
      Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[category];
  };

  const activeFiltersCount = [showOnlyWithFood, showOnlyVolunteering, showOnlyAvailableSeats].filter(Boolean).length + (selectedCategory !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-[#182E55] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-white mb-2">Campus Events</h1>
          <p className="text-white/80">Discover and join exciting events at Kent Institute</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events by title, description, location, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-md hover:bg-muted transition"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#182E55] text-white rounded text-xs">{activeFiltersCount}</span>
            )}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white border border-border rounded-lg p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-md border transition ${
                      selectedCategory === 'All'
                        ? 'bg-[#182E55] text-white border-[#182E55]'
                        : 'bg-white border-border hover:border-[#182E55]/30'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-md border transition ${
                        selectedCategory === category
                          ? 'bg-[#182E55] text-white border-[#182E55]'
                          : 'bg-white border-border hover:border-[#182E55]/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Filters */}
              <div>
                <h3 className="mb-3">Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyWithFood}
                      onChange={(e) => setShowOnlyWithFood(e.target.checked)}
                      className="w-4 h-4 accent-[#182E55]"
                    />
                    <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                    <span>Food Provided</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyVolunteering}
                      onChange={(e) => setShowOnlyVolunteering(e.target.checked)}
                      className="w-4 h-4 accent-[#182E55]"
                    />
                    <HandHeart className="w-4 h-4 text-muted-foreground" />
                    <span>Volunteers Needed</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyAvailableSeats}
                      onChange={(e) => setShowOnlyAvailableSeats(e.target.checked)}
                      className="w-4 h-4 accent-[#182E55]"
                    />
                    <Armchair className="w-4 h-4 text-muted-foreground" />
                    <span>Seats Available</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all hover:border-[#182E55]/30 overflow-hidden flex flex-col group"
              >
                {/* Event Image */}
                {event.thumbnailUrl && (
                  <Link to={`/events/${event.id}`} className="relative h-48 overflow-hidden">
                    <img
                      src={event.thumbnailUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Bookmark Button */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleBookmark(event.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isBookmarked(event.id) ? 'fill-[#EEA928] text-[#EEA928]' : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    )}
                  </Link>
                )}

                <Link to={`/events/${event.id}`} className="flex-1 flex flex-col p-4">
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs border ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="mb-2 line-clamp-2 group-hover:text-[#182E55] transition">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{formatDate(event.date)}</div>
                          <div>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{event.rsvpCount} attending</span>
                      </div>
                    </div>

                    {/* Features Icons */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                      {event.food?.provided && (
                        <div className="flex items-center gap-1 text-xs text-success" title="Food provided">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>Food</span>
                        </div>
                      )}
                      {event.volunteering?.needed && (
                        <div className="flex items-center gap-1 text-xs text-accent" title="Volunteers needed">
                          <HandHeart className="w-3.5 h-3.5" />
                          <span>Volunteers</span>
                        </div>
                      )}
                      {event.seating?.remaining && event.seating.remaining > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Seats available">
                          <Armchair className="w-3.5 h-3.5" />
                          <span>{event.seating.remaining} seats</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Footer */}
                <div className="px-4 py-3 bg-muted/30 flex items-center justify-between border-t border-border">
                  <span className="text-xs text-muted-foreground">by {event.organiserName}</span>
                  <div className="flex items-center gap-1">
                    {event.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-white rounded-full border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-border">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-muted-foreground mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
