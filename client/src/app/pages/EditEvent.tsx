// ============================================
// File:    EditEvent.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Displays the event editing form for organizers and admins, including moderation-aware status changes.
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useApp } from '../context/AppContext';
import { Category, EventCategory } from '../types';
import { toast } from 'sonner';

/**
 * Renders the event editing page for organizers and admins.
 * @returns {JSX.Element | null} Event edit form, or null while redirecting unauthorized users.
 */
export function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, events, updateEvent } = useApp();

  const event = events.find(e => e.id === eventId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Academic');
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState<number | undefined>();
  const [seatingCapacity, setSeatingCapacity] = useState<number | undefined>();
  const [foodProvided, setFoodProvided] = useState(false);
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [newFoodOption, setNewFoodOption] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'pending' | 'published' | 'rejected' | 'cancelled'>('pending');
  const isPublishedEvent = event?.status === 'published';

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setLocation(event.location);
      setCategory(event.category);
      setImage(event.image || '');
      setVolunteersNeeded(event.volunteersNeeded);
      setSeatingCapacity(event.seatingCapacity);
      setFoodProvided(event.foodProvided || false);
      setFoodOptions(event.foodOptions || []);
      setNotes(event.notes || '');
      setStatus(event.status === 'published' ? 'pending' : event.status);
    }
  }, [event]);

  useEffect(() => {
    /**
     * Asynchronously loads available event categories for the edit form.
     * @returns {Promise<void>} Resolves after category options are fetched and stored.
     */
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }

    loadCategories();
  }, []);

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    navigate('/login');
    return null;
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (user.role !== 'admin' && event.organizerId !== user.id) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
        <p className="mb-4">You can only edit events you created.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  /**
   * Adds a food option to the event form when food service is enabled.
   * @returns {void} Does not return a value.
   */
  const handleAddFoodOption = () => {
    if (newFoodOption.trim()) {
      setFoodOptions([...foodOptions, newFoodOption.trim()]);
      setNewFoodOption('');
    }
  };

  /**
   * Removes a food option from the event form by index.
   * @param {number} index - Position of the food option to remove.
   * @returns {void} Does not return a value.
   */
  const handleRemoveFoodOption = (index: number) => {
    setFoodOptions(foodOptions.filter((_, i) => i !== index));
  };

  /**
   * Submits the updated event details and returns the user to the dashboard.
   * @param {React.FormEvent} e - Form submit event from the edit-event page.
   * @returns {void} Does not return a value.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      category,
      image,
      status,
      volunteersNeeded,
      seatingCapacity,
      foodProvided,
      foodOptions: foodProvided ? foodOptions : undefined,
      notes: notes || undefined,
    };

    const result = await updateEvent(event.id, updates);

    if (result.event) {
      toast.success('Event updated successfully.');
      navigate('/dashboard');
      return;
    }

    toast.error(result.error || 'Failed to update event.');
  };

  return (
    <div className="min-h-screen bg-[#F0F3F9]">
      <div className="bg-[#1B2E55] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Edit Event</h1>
          <p className="text-lg text-white/90">Update the details for your event</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Update information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as EventCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((entry) => (
                        <SelectItem key={entry.id} value={entry.name}>{entry.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'pending' | 'published' | 'rejected' | 'cancelled')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {user.role === 'admin' ? (
                        <>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Submit for Review</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {isPublishedEvent && (
                    <p className="text-sm text-muted-foreground">
                      Editing a published event will send it back to pending review for admin approval.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Event Image URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Additional Options</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteersNeeded">Volunteers Needed</Label>
                    <Input
                      id="volunteersNeeded"
                      type="number"
                      min="0"
                      value={volunteersNeeded || ''}
                      onChange={(e) => setVolunteersNeeded(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      min="0"
                      value={seatingCapacity || ''}
                      onChange={(e) => setSeatingCapacity(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="foodProvided">Food Provided</Label>
                      <p className="text-sm text-muted-foreground">
                        Will food be available at this event?
                      </p>
                    </div>
                    <Switch
                      id="foodProvided"
                      checked={foodProvided}
                      onCheckedChange={setFoodProvided}
                    />
                  </div>

                  {foodProvided && (
                    <div className="space-y-2 pl-4 border-l-2">
                      <Label>Food Options</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFoodOption}
                          onChange={(e) => setNewFoodOption(e.target.value)}
                          placeholder="e.g., Vegetarian option"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFoodOption())}
                        />
                        <Button type="button" onClick={handleAddFoodOption} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {foodOptions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {foodOptions.map((option, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{option}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFoodOption(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Important Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
