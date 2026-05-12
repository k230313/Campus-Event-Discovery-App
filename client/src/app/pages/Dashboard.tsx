import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Bookmark, Users, Plus, Edit, Trash2, Eye, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useApp } from '../context/AppContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, events, bookmarks, rsvps, deleteEvent } = useApp();

  if (!user) {
    navigate('/login');
    return null;
  }

  const bookmarkedEvents = events.filter(event =>
    bookmarks.some(b => b.eventId === event.id && b.userId === user.id)
  );

  const rsvpEvents = events.filter(event =>
    rsvps.some(r => r.eventId === event.id && r.userId === user.id)
  );

  const myEvents = events.filter(event => event.organizerId === user.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteEvent(eventId);
    }
  };

  if (user.role === 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9]">
        <div className="relative bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55] text-white py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#EF9B28]/10 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-3 bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]/30">
                  Organizer
                </Badge>
                <h1 className="text-5xl font-bold mb-3">Dashboard</h1>
                <p className="text-xl text-white/90">Welcome back, {user.name}!</p>
              </div>
              <Link to="/create-event">
                <Button size="lg" className="bg-gradient-to-r from-[#EF9B28] to-[#d68a20] hover:from-[#d68a20] hover:to-[#EF9B28] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold text-blue-900 mb-1">{myEvents.length}</CardTitle>
                <CardDescription className="text-blue-700 font-medium">Events Created</CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold text-green-900 mb-1">
                  {myEvents.reduce((sum, e) => sum + e.rsvpCount, 0)}
                </CardTitle>
                <CardDescription className="text-green-700 font-medium">Total RSVPs</CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">Total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold text-purple-900 mb-1">
                  {myEvents.reduce((sum, e) => sum + e.viewCount, 0)}
                </CardTitle>
                <CardDescription className="text-purple-700 font-medium">Total Views</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* My Events */}
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="text-2xl text-[#1B2E55]">My Events</CardTitle>
              <CardDescription className="text-base">
                Events you have created and are managing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {myEvents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any events yet. Get started now!
                  </p>
                  <Link to="/create-event">
                    <Button size="lg" className="bg-gradient-to-r from-[#EF9B28] to-[#d68a20] hover:from-[#d68a20] hover:to-[#EF9B28] text-white shadow-lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myEvents.map(event => (
                    <div key={event.id} className="border-2 rounded-xl p-5 hover:shadow-lg hover:border-[#EF9B28]/30 transition-all duration-300 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-[#1B2E55] text-white">{event.category}</Badge>
                            <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className={event.status === 'published' ? 'bg-green-100 text-green-800' : ''}>
                              {event.status}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-xl mb-3 text-[#1B2E55]">{event.title}</h3>
                          <div className="grid md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium">{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-medium">{event.startTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Eye className="h-4 w-4 text-amber-600" />
                              </div>
                              <span className="font-medium">{event.viewCount} views</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-medium">{event.rsvpCount} RSVPs</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link to={`/events/${event.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link to={`/edit-event/${event.id}`}>
                            <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student Dashboard
  return (
    <div className="min-h-screen bg-[#F0F3F9]">
      <div className="bg-[#1B2E55] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-lg text-white/90">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rsvp" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="rsvp">
              <Users className="h-4 w-4 mr-2" />
              My RSVPs ({rsvpEvents.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarked ({bookmarkedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp">
            <Card>
              <CardHeader>
                <CardTitle>Events I'm Attending</CardTitle>
                <CardDescription>
                  Events you have RSVP'd to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rsvpEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't RSVP'd to any events yet
                    </p>
                    <Link to="/events">
                      <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {rsvpEvents.map(event => {
                      const rsvp = rsvps.find(r => r.eventId === event.id && r.userId === user.id);
                      return (
                        <Card key={event.id} className="overflow-hidden">
                          <div className="h-40 overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{event.category}</Badge>
                              {rsvp?.attendeeType === 'volunteer' && (
                                <Badge variant="secondary">Volunteering</Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                              {rsvp?.selectedFoodOption && (
                                <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
                                  Food: {rsvp.selectedFoodOption}
                                </div>
                              )}
                              {rsvp?.seatNumber && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800">
                                  Seat: {rsvp.seatNumber}
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link to={`/events/${event.id}`} className="w-full">
                              <Button variant="outline" className="w-full">
                                View Details
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarked Events</CardTitle>
                <CardDescription>
                  Events you've saved for later
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookmarkedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't bookmarked any events yet
                    </p>
                    <Link to="/events">
                      <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {bookmarkedEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <Badge className="w-fit mb-2">{event.category}</Badge>
                          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {event.startTime} - {event.endTime}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link to={`/events/${event.id}`} className="w-full">
                            <Button className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                              View Details
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

