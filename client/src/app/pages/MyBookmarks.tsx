import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bookmark, Calendar, MapPin, Users, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function MyBookmarks() {
  const { user, events, bookmarks, removeBookmark } = useApp();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const bookmarkedEvents = events.filter((event) =>
    bookmarks.some((b) => b.eventId === event.id && b.userId === user.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Bookmark className="h-10 w-10 text-[#EF9B28]" />
              My Bookmarks
            </h1>
            <p className="text-muted-foreground">Events you've saved for later</p>
          </div>

          {bookmarkedEvents.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1B2E55] mb-2">No bookmarks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start bookmarking events you're interested in to save them here
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedEvents.map((event) => (
                <Card key={event.id} className="border-2 hover:border-[#EF9B28]/50 hover:shadow-lg transition-all group">
                  <CardContent className="pt-6 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeBookmark(event.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {event.image && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <Badge className="mb-3">{event.category}</Badge>
                    <h3 className="font-bold text-lg text-[#1B2E55] mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()} at {event.startTime}
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

                    <Link to={`/events/${event.id}`}>
                      <Button className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

