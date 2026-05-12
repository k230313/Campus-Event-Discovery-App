import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useApp } from '../context/AppContext';
import { EventCategory } from '../types';

export function CreateEvent() {
  const navigate = useNavigate();
  const { user, createEvent } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Academic');
  const [image, setImage] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState<number | undefined>();
  const [seatingCapacity, setSeatingCapacity] = useState<number | undefined>();
  const [foodProvided, setFoodProvided] = useState(false);
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [newFoodOption, setNewFoodOption] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  if (!user || user.role !== 'organizer') {
    navigate('/login');
    return null;
  }

  const handleAddFoodOption = () => {
    if (newFoodOption.trim()) {
      setFoodOptions([...foodOptions, newFoodOption.trim()]);
      setNewFoodOption('');
    }
  };

  const handleRemoveFoodOption = (index: number) => {
    setFoodOptions(foodOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      category,
      image: image || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
      status,
      volunteersNeeded,
      volunteersRegistered: 0,
      seatingCapacity,
      seatsBooked: 0,
      foodProvided,
      foodOptions: foodProvided ? foodOptions : undefined,
      notes: notes || undefined,
    };

    createEvent(eventData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F0F3F9]">
      <div className="bg-[#1B2E55] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Create New Event</h1>
          <p className="text-lg text-white/90">Fill in the details for your campus event</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Provide information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Industry Networking Night"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of your event..."
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
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Career">Career</SelectItem>
                      <SelectItem value="Club">Club</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
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
                  placeholder="e.g., Level 11, 10 Barrack St, Sydney"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Event Image URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <p className="text-sm text-muted-foreground">
                  Leave blank to use default image
                </p>
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
                      placeholder="e.g., 5"
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
                      placeholder="e.g., 150"
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
                      placeholder="Any important information attendees should know..."
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
              Create Event
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
