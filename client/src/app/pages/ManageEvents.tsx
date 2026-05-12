import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Edit, Trash2, Eye, Users, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ManageEvents() {
  const { user, events, deleteEvent } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== 'organizer') {
    navigate('/');
    return null;
  }

  const myEvents = events.filter((event) => event.organizerId === user.id);

  const handleDelete = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteEvent(eventId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#1B2E55] mb-2">Manage Events</h1>
              <p className="text-muted-foreground">Create, edit, and manage your events</p>
            </div>
            <Link to="/create-event">
              <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                    <p className="text-3xl font-bold text-[#1B2E55]">{myEvents.length}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-[#1B2E55]/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Published</p>
                    <p className="text-3xl font-bold text-green-600">
                      {myEvents.filter((e) => e.status === 'published').length}
                    </p>
                  </div>
                  <Eye className="h-10 w-10 text-green-600/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Drafts</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {myEvents.filter((e) => e.status === 'draft').length}
                    </p>
                  </div>
                  <Edit className="h-10 w-10 text-yellow-600/20" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total RSVPs</p>
                    <p className="text-3xl font-bold text-[#EF9B28]">
                      {myEvents.reduce((sum, e) => sum + e.rsvpCount, 0)}
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-[#EF9B28]/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          {myEvents.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1B2E55] mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first event to start managing campus activities
                </p>
                <Link to="/create-event">
                  <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="border-2 hover:border-[#EF9B28]/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-6 items-center">
                      {/* Event Info */}
                      <div className="md:col-span-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge>{event.category}</Badge>
                          <Badge
                            variant="outline"
                            className={
                              event.status === 'published'
                                ? 'bg-green-500/10 text-green-600 border-green-500'
                                : event.status === 'draft'
                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500'
                                : 'bg-red-500/10 text-red-600 border-red-500'
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg text-[#1B2E55] mb-2">{event.title}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()} at {event.startTime}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {event.rsvpCount} RSVPs
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {event.viewCount} views
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex gap-2">
                        <Link to={`/events/${event.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/edit-event/${event.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(event.id, event.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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

