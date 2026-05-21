// ============================================
// File:    AdminManageEvents.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Admin Manage Events page for the frontend application.
// ============================================

import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Search, Edit, Trash2, Eye, CheckCircle, XCircle, Ban, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * Renders the AdminManageEvents component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function AdminManageEvents() {
  const { user, events, deleteEvent, updateEventStatus } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Asynchronously executes the handle delete logic.
   * @param {*} eventId - Represents the eventId input.
   * @param {*} eventTitle - Represents the eventTitle input.
   * @returns {*} Returns the resulting value.
   */
  const handleDelete = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteEvent(eventId);
    }
  };

  /**
   * Asynchronously executes the handle status change logic.
   * @param {*} eventId - Represents the eventId input.
   * @param {*} status - Represents the status input.
   * @returns {*} Returns the resulting value.
   */
  const handleStatusChange = async (eventId: string, status: 'draft' | 'pending' | 'published' | 'rejected' | 'cancelled') => {
    const nextReviewNotes = reviewNotes[eventId] ?? eventNotesFallback(eventId);

    if (status === 'rejected' && !nextReviewNotes.trim()) {
      alert('A rejection reason is required.');
      return;
    }

    await updateEventStatus(eventId, status, nextReviewNotes);

    if (status === 'pending') {
      setReviewNotes((current) => ({ ...current, [eventId]: '' }));
    }
  };

  /**
   * Asynchronously executes the event notes fallback logic.
   * @param {*} eventId - Represents the eventId input.
   * @returns {*} Returns the resulting value.
   */
  const eventNotesFallback = (eventId: string) => {
    const event = events.find((entry) => entry.id === eventId);
    return event?.reviewNotes ?? '';
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
                              : event.status === 'pending'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500'
                              : event.status === 'draft'
                              ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500'
                              : event.status === 'rejected'
                              ? 'bg-red-500/10 text-red-600 border-red-500'
                              : 'bg-gray-500/10 text-gray-600 border-gray-500'
                          }
                        >
                          {event.status === 'published' ? <CheckCircle className="h-3 w-3 mr-1" /> : event.status === 'pending' ? <Clock3 className="h-3 w-3 mr-1" /> : event.status === 'cancelled' ? <Ban className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {event.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-[#1B2E55] mb-2">{event.title}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Organizer: {event.organizerName}</p>
                        <p>{new Date(event.date).toLocaleDateString()} at {event.startTime}</p>
                        <p>{event.rsvpCount} RSVPs • {event.viewCount} views</p>
                        {event.reviewedAt && (
                          <p>Reviewed: {new Date(event.reviewedAt).toLocaleString()}</p>
                        )}
                      </div>
                      {(event.reviewNotes || event.status === 'rejected') && (
                        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="font-medium text-slate-900">Latest admin feedback</p>
                          <p>{event.reviewNotes || 'No note provided.'}</p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <div className="flex gap-2">
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
                      <Textarea
                        value={reviewNotes[event.id] ?? event.reviewNotes ?? ''}
                        onChange={(e) => setReviewNotes((current) => ({ ...current, [event.id]: e.target.value }))}
                        placeholder="Add approval note or required rejection reason..."
                        rows={3}
                      />
                      <div className="flex flex-wrap gap-2">
                        {event.status !== 'published' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange(event.id, 'published')}>
                            Approve
                          </Button>
                        )}
                        {event.status !== 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(event.id, 'pending')}>
                            Mark Pending
                          </Button>
                        )}
                        {event.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange(event.id, 'rejected')}>
                            Reject
                          </Button>
                        )}
                        {event.status !== 'cancelled' && (
                          <Button size="sm" variant="outline" className="text-gray-700 hover:bg-gray-100" onClick={() => handleStatusChange(event.id, 'cancelled')}>
                            Cancel
                          </Button>
                        )}
                      </div>
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
