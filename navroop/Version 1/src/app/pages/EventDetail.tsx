import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Bookmark,
  ArrowLeft,
  User,
  FileText,
  UtensilsCrossed,
  HandHeart,
  Armchair,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { mockEvents } from '../data/mockEvents';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import { useRSVP } from '../context/RSVPContext';
import { EventCategory } from '../types';

export function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isRSVPed, addRSVP, cancelRSVP } = useRSVP();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [selectedVolunteerPositions, setSelectedVolunteerPositions] = useState<string[]>([]);

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Event Not Found</h2>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  const handleRSVP = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isRSVPed(event.id)) {
      cancelRSVP(event.id);
    } else {
      if (event.food?.dietaryOptions || event.volunteering?.needed) {
        setShowRSVPModal(true);
      } else {
        addRSVP(event.id);
      }
    }
  };

  const confirmRSVP = () => {
    addRSVP(event.id, {
      dietaryRestrictions: dietaryRestrictions,
      volunteerPositions: selectedVolunteerPositions,
    });
    setShowRSVPModal(false);
    setDietaryRestrictions([]);
    setSelectedVolunteerPositions([]);
  };

  const images = event.images || [];
  const displayImage = images[selectedImage] || event.images?.[0];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-[#182E55] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs border ${getCategoryColor(
                  event.category
                )}`}
              >
                {event.category}
              </span>
              <h1 className="text-white mt-3 mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {event.viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.rsvpCount} attending
                </div>
                {event.capacity && (
                  <div className="flex items-center gap-1">
                    <Armchair className="w-4 h-4" />
                    {event.seating?.remaining || 0} / {event.capacity} available
                  </div>
                )}
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => toggleBookmark(event.id)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition"
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked(event.id) ? 'fill-[#EEA928] text-[#EEA928]' : ''}`}
                />
                <span className="hidden sm:inline">{isBookmarked(event.id) ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-[#182E55]" />
                  <h2>Event Photos</h2>
                </div>
                <div className="space-y-4">
                  {/* Main Image */}
                  {displayImage && (
                    <div className="relative h-96 rounded-lg overflow-hidden">
                      <img
                        src={displayImage.url}
                        alt={displayImage.alt}
                        className="w-full h-full object-cover"
                      />
                      {displayImage.photographer && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-xs">
                          Photo by{' '}
                          <a
                            href={displayImage.photographerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#EEA928]"
                          >
                            {displayImage.photographer}
                          </a>{' '}
                          on Unsplash
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border-2 transition ${
                            selectedImage === idx
                              ? 'border-[#182E55]'
                              : 'border-border hover:border-[#182E55]/30'
                          }`}
                        >
                          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#182E55]" />
                <h2>About This Event</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-sm rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Food Information */}
            {event.food?.provided && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-[#182E55]" />
                  <h2>Food & Refreshments</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Food Provided{event.food.cost === 0 && ' - Free!'}</span>
                  </div>

                  {event.food.type && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type:</p>
                      <p className="capitalize">{event.food.type.replace('-', ' ')}</p>
                    </div>
                  )}

                  {event.food.menu && event.food.menu.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Menu:</p>
                      <ul className="grid grid-cols-2 gap-2">
                        {event.food.menu.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-success" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {event.food.dietaryOptions && event.food.dietaryOptions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Dietary Options:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.food.dietaryOptions.map((option) => (
                          <span
                            key={option}
                            className="px-3 py-1 bg-success/10 text-success text-sm rounded-full border border-success/20"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Volunteering Opportunities */}
            {event.volunteering?.needed && event.volunteering.positions && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HandHeart className="w-5 h-5 text-[#182E55]" />
                    <h2>Volunteer Opportunities</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.volunteering.filledSpots || 0} / {event.volunteering.totalSpots || 0} filled
                  </span>
                </div>

                <div className="space-y-4">
                  {event.volunteering.positions.map((position) => (
                    <div
                      key={position.id}
                      className="p-4 border border-border rounded-lg hover:border-[#182E55]/30 transition"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="flex-1">{position.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {position.filledSpots} / {position.spots}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{position.description}</p>

                      {position.requirements && position.requirements.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {position.requirements.map((req) => (
                              <span
                                key={req}
                                className="text-xs px-2 py-1 bg-muted rounded-full border border-border"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {position.filledSpots >= position.spots && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <XCircle className="w-4 h-4" />
                          <span>Position filled</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {event.notes && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <h3 className="mb-2">Important Information</h3>
                <p className="text-sm text-muted-foreground">{event.notes}</p>
              </div>
            )}

            {/* RSVP Button */}
            <div>
              {isAuthenticated ? (
                <button
                  onClick={handleRSVP}
                  className={`w-full py-4 rounded-lg transition ${
                    isRSVPed(event.id)
                      ? 'bg-muted text-foreground border-2 border-border hover:bg-muted/80'
                      : 'bg-[#182E55] text-white hover:bg-[#182E55]/90'
                  }`}
                >
                  {isRSVPed(event.id) ? 'Cancel RSVP' : 'Reserve Your Spot'}
                </button>
              ) : (
                <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    Sign in to reserve your spot for this event
                  </p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-3 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#182E55] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date</div>
                    <div>{formatDate(event.date)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#182E55] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Time</div>
                    <div>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#182E55] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div>{event.location}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#182E55] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Organiser</div>
                    <div>{event.organiserName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seating Information */}
            {event.seating?.available && (
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Armchair className="w-5 h-5 text-[#182E55]" />
                  <h3>Seating Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="capitalize">{event.seating.type?.replace('-', ' ')}</span>
                  </div>
                  {event.seating.capacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span>{event.seating.capacity}</span>
                    </div>
                  )}
                  {event.seating.remaining !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span
                        className={
                          event.seating.remaining < 10 ? 'text-warning' : 'text-success'
                        }
                      >
                        {event.seating.remaining}
                      </span>
                    </div>
                  )}
                  {event.seating.accessibility && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span>Wheelchair accessible</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span>{event.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attending</span>
                  <span>{event.rsvpCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full capitalize">
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRSVPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="mb-4">Complete Your RSVP</h2>

            <div className="space-y-4 mb-6">
              {/* Dietary Restrictions */}
              {event.food?.dietaryOptions && event.food.dietaryOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-2">Dietary Restrictions (Optional)</label>
                  <div className="space-y-2">
                    {event.food.dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dietaryRestrictions.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDietaryRestrictions([...dietaryRestrictions, option]);
                            } else {
                              setDietaryRestrictions(
                                dietaryRestrictions.filter((d) => d !== option)
                              );
                            }
                          }}
                          className="w-4 h-4 accent-[#182E55]"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Volunteer Positions */}
              {event.volunteering?.needed && event.volunteering.positions && (
                <div>
                  <label className="block text-sm mb-2">
                    Volunteer for these positions (Optional)
                  </label>
                  <div className="space-y-2">
                    {event.volunteering.positions
                      .filter((p) => p.filledSpots < p.spots)
                      .map((position) => (
                        <label key={position.id} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedVolunteerPositions.includes(position.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVolunteerPositions([
                                  ...selectedVolunteerPositions,
                                  position.id,
                                ]);
                              } else {
                                setSelectedVolunteerPositions(
                                  selectedVolunteerPositions.filter((p) => p !== position.id)
                                );
                              }
                            }}
                            className="w-4 h-4 accent-[#182E55] mt-0.5"
                          />
                          <div>
                            <p className="text-sm">{position.title}</p>
                            <p className="text-xs text-muted-foreground">{position.description}</p>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmRSVP}
                className="flex-1 px-4 py-2 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition"
              >
                Confirm RSVP
              </button>
              <button
                onClick={() => setShowRSVPModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
