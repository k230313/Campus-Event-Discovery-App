import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Calendar, MapPin, FileText, Tag, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventCategory } from '../types';

const categories: EventCategory[] = ['Academic', 'Social', 'Career', 'Club', 'Workshop', 'Other'];

export function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: 'Academic' as EventCategory,
    notes: '',
  });

  // Redirect if not an organiser
  if (!user || user.role !== 'organiser') {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Only organisers can create events
          </p>
          <Link
            to="/events"
            className="inline-block px-6 py-3 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.location
    ) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate date is in the future
    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      setError('Event date must be in the future');
      return;
    }

    // Validate end time is after start time
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      // Mock API call - simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, this would call your backend API
      console.log('Creating event:', formData);

      // Success - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-[#182E55] text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-white">Create New Event</h1>
          <p className="text-white/80 mt-2">Fill in the details to create your event</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-border p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#182E55]" />
                Event Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Industry Networking Night"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#182E55]" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your event..."
                rows={5}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                disabled={loading}
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#182E55]" />
                  Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block mb-2">
                  Start Time *
                </label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block mb-2">
                  End Time *
                </label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#182E55]" />
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Level 11, 10 Barrack St, Sydney"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                disabled={loading}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[#182E55]" />
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                disabled={loading}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information or requirements..."
                rows={3}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
            <Link
              to="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
