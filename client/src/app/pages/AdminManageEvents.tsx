import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Calendar, Search, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function AdminManageEvents() {
  const { user, events, deleteEvent } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteEvent(eventId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Calendar className="h-10 w-10 text-[#EF9B28]" />
              Manage Events (Admin)
            </h1>
            <p className="text-muted-foreground">Oversee all events across the platform</p>
          </div>

          {/* Search */}
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events by title or organizer..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-5 gap-6 items-center">
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
                          {event.status === 'published' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {event.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-[#1B2E55] mb-2">{event.title}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Organizer: {event.organizerName}</p>
                        <p>{new Date(event.date).toLocaleDateString()} at {event.startTime}</p>
                        <p>{event.rsvpCount} RSVPs • {event.viewCount} views</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/edit-event/${event.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
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
        </div>
      </div>
    </div>
  );
}

