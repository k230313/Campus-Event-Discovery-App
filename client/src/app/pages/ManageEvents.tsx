// ============================================
// File:    ManageEvents.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Displays the organizer event-management workspace with attendee and export tools.
// ============================================

import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Calendar, Edit, Trash2, Eye, Users, PlusCircle, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { EventAttendee } from '../types';
import { toast } from 'sonner';

/**
 * Renders the organizer event-management page with attendee viewing and CSV export tools.
 * @returns {JSX.Element | null} Organizer event-management interface, or null while redirecting.
 */
export function ManageEvents() {
  const { user, events, deleteEvent, getEventAttendees } = useApp();
  const navigate = useNavigate();
  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<EventAttendee[]>([]);
  const [loadingAttendeesFor, setLoadingAttendeesFor] = useState<string | null>(null);
  const [attendeeError, setAttendeeError] = useState<string | null>(null);

  if (!user || user.role !== 'organizer') {
    navigate('/');
    return null;
  }

  const myEvents = events.filter((event) => event.organizerId === user.id);

  /**
   * Confirms and deletes one of the organizer's events.
   * @param {string} eventId - Identifier of the event to delete.
   * @param {string} eventTitle - Event title shown in the confirmation prompt.
   * @returns {void} Does not return a value.
   */
  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast.success(`"${eventTitle}" deleted successfully.`);
        return;
      }

      toast.error(result.error || `Failed to delete "${eventTitle}".`);
    }
  };

  const attendeeCountLabel = useMemo(
    () => `${selectedAttendees.length} attendee${selectedAttendees.length === 1 ? '' : 's'}`,
    [selectedAttendees.length]
  );

  /**
   * Asynchronously loads and displays the attendee list for the selected event.
   * @param {string} eventId - Identifier of the event whose attendees should be loaded.
   * @returns {Promise<void>} Resolves after attendee data and dialog state are updated.
   */
  const handleViewAttendees = async (eventId: string) => {
    setLoadingAttendeesFor(eventId);
    setAttendeeError(null);

    try {
      const data = await getEventAttendees(eventId);
      setSelectedEventTitle(data.eventTitle);
      setSelectedAttendees(data.attendees);
      setAttendeeDialogOpen(true);
    } catch (error) {
      console.error('Load attendees failed:', error);
      setAttendeeError(error instanceof Error ? error.message : 'Failed to load attendees');
      setAttendeeDialogOpen(true);
    } finally {
      setLoadingAttendeesFor(null);
    }
  };

  /**
   * Exports the currently displayed attendee list to a CSV file.
   * @returns {void} Does not return a value.
   */
  const handleExportAttendees = () => {
    if (!selectedAttendees.length) {
      return;
    }

    /**
     * Escapes a CSV cell value so exported data remains valid when opened in spreadsheet tools.
     * @param {string} value - Raw cell value to escape.
     * @returns {string} CSV-safe value wrapped in quotes.
     */
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Email', 'Registered At'],
      ...selectedAttendees.map((attendee) => [
        attendee.name,
        attendee.email,
        new Date(attendee.registeredAt).toLocaleString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => escapeCsv(String(value))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = selectedEventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    link.href = url;
    link.download = `${safeTitle || 'event'}-attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                          {event.reviewedAt && (
                            <div>Reviewed {new Date(event.reviewedAt).toLocaleString()}</div>
                          )}
                        </div>
                        {(event.reviewNotes || event.status === 'rejected') && (
                          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                            <p className="font-medium text-slate-900">Latest admin feedback</p>
                            <p>{event.reviewNotes || 'No note provided.'}</p>
                          </div>
                        )}
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
                          className="flex-1"
                          onClick={() => handleViewAttendees(event.id)}
                          disabled={loadingAttendeesFor === event.id}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {loadingAttendeesFor === event.id ? 'Loading...' : 'Attendees'}
                        </Button>
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

      <Dialog open={attendeeDialogOpen} onOpenChange={setAttendeeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attendees for {selectedEventTitle || 'event'}</DialogTitle>
            <DialogDescription>
              Review your registered attendees and export them as CSV for offline use.
            </DialogDescription>
          </DialogHeader>

          {attendeeError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {attendeeError}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{attendeeCountLabel}</p>
                <Button onClick={handleExportAttendees} disabled={!selectedAttendees.length}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {selectedAttendees.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No attendees have registered for this event yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAttendees.map((attendee) => (
                      <TableRow key={`${attendee.userId}-${attendee.registeredAt}`}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.email}</TableCell>
                        <TableCell>{new Date(attendee.registeredAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
