import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Event, Bookmark, RSVP } from '../types';

interface AppContextType {
  user: User | null;
  setCurrentUser: (nextUser: User | null) => void;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'organizer', turnstileToken: string) => Promise<User | null>;
  events: Event[];
  bookmarks: Bookmark[];
  rsvps: RSVP[];
  addBookmark: (eventId: string) => Promise<void>;
  removeBookmark: (eventId: string) => Promise<void>;
  isBookmarked: (eventId: string) => boolean;
  addRSVP: (eventId: string, attendeeType: 'attendee' | 'volunteer', options?: { foodOption?: string; seatNumber?: number }) => Promise<void>;
  removeRSVP: (eventId: string) => Promise<void>;
  hasRSVP: (eventId: string) => boolean;
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => Promise<{ event: Event | null; error: string | null }>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  updateEventStatus: (eventId: string, status: Event['status']) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'ceda_user';
const LEGACY_AUTH_TOKEN_KEY = 'ceda_auth_token';

function normalizeEvent(apiEvent: any): Event {
  return {
    id: String(apiEvent.id),
    title: apiEvent.title,
    description: apiEvent.description,
    date: apiEvent.date,
    startTime: apiEvent.startTime || '09:00:00',
    endTime: apiEvent.endTime || '10:00:00',
    location: apiEvent.location,
    category: apiEvent.category,
    organizerId: String(apiEvent.organizerId || '2'),
    organizerName: apiEvent.organiser_name || apiEvent.organizerName || 'Kent Institute',
    image: apiEvent.image || undefined,
    status: apiEvent.status || 'published',
    viewCount: Number(apiEvent.viewCount || 0),
    rsvpCount: Number(apiEvent.rsvpCount || 0),
    volunteersNeeded: apiEvent.volunteersNeeded ?? undefined,
    volunteersRegistered: apiEvent.volunteersRegistered ?? undefined,
    seatingCapacity: apiEvent.seatingCapacity ?? apiEvent.capacity ?? undefined,
    seatsBooked: apiEvent.seatsBooked ?? undefined,
    foodProvided: Boolean(apiEvent.foodProvided),
    foodOptions: apiEvent.foodOptions ?? undefined,
    notes: apiEvent.notes ?? undefined,
    createdAt: apiEvent.createdAt || new Date().toISOString(),
  };
}

function normalizeUser(apiUser: any): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
  };
}

function buildRequestOptions(init?: RequestInit): RequestInit {
  return {
    credentials: 'include',
    ...init,
  };
}

async function getApiErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join(', ');
    }

    if (typeof data?.error === 'string' && data.error) {
      return data.error;
    }
  } catch {
    // Ignore JSON parsing failures and use fallback below.
  }

  return fallback;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  function setCurrentUser(nextUser: User | null) {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const savedBookmarks = localStorage.getItem('ceda_bookmarks');
    const savedRsvps = localStorage.getItem('ceda_rsvps');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    if (savedRsvps) {
      setRSVPs(JSON.parse(savedRsvps));
    }

    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);

    fetch('/api/auth/me', buildRequestOptions())
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to restore session');
        }
        return response.json();
      })
      .then((data) => {
        const nextUser = normalizeUser(data.user);
        setCurrentUser(nextUser);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  async function loadEvents() {
    try {
      const response = await fetch('/api/events', buildRequestOptions());
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.map(normalizeEvent));
    } catch (error) {
      console.error('Failed to load events from API:', error);
      setEvents([]);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('ceda_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ceda_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setBookmarks([]);
        setRSVPs([]);
        return;
      }

      try {
        if (user.role === 'student' || user.role === 'organizer') {
          const [bookmarkResponse, registrationResponse] = await Promise.all([
            fetch('/api/bookmarks', buildRequestOptions()),
            fetch('/api/registrations', buildRequestOptions()),
          ]);

          if (bookmarkResponse.ok) {
            const bookmarkData = await bookmarkResponse.json();
            setBookmarks(bookmarkData);
          }

          if (registrationResponse.ok) {
            const registrationData = await registrationResponse.json();
            setRSVPs(registrationData);
          }
        } else {
          setBookmarks([]);
          setRSVPs([]);
        }
      } catch (error) {
        console.error('Failed to load user-specific data:', error);
      }
    }

    loadUserData();
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    if (!email || !password) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/login', buildRequestOptions({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }));

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const nextUser = normalizeUser(data.user);
      setCurrentUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', buildRequestOptions({ method: 'POST' })).catch((error) => {
      console.error('Logout request failed:', error);
    });
    setCurrentUser(null);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'organizer',
    turnstileToken: string
  ): Promise<User | null> => {
    if (!name || !email || !password || !turnstileToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/register', buildRequestOptions({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, turnstileToken }),
      }));

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const nextUser = normalizeUser(data.user);
      setCurrentUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  };

  const addBookmark = async (eventId: string) => {
    if (!user || (user.role !== 'student' && user.role !== 'organizer') || bookmarks.some((b) => b.eventId === eventId && b.userId === user.id)) return;

    try {
      const response = await fetch('/api/bookmarks', buildRequestOptions({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      }));

      if (!response.ok) {
        throw new Error('Failed to save bookmark');
      }

      const savedBookmark = await response.json();
      setBookmarks((current) => [...current.filter((bookmark) => !(bookmark.eventId === eventId && bookmark.userId === user.id)), savedBookmark]);
    } catch (error) {
      console.error('Add bookmark failed:', error);
    }
  };

  const removeBookmark = async (eventId: string) => {
    if (!user || (user.role !== 'student' && user.role !== 'organizer')) return;

    try {
      const response = await fetch(`/api/bookmarks/${eventId}`, buildRequestOptions({
        method: 'DELETE',
      }));

      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }

      setBookmarks((current) => current.filter((bookmark) => !(bookmark.eventId === eventId && bookmark.userId === user.id)));
    } catch (error) {
      console.error('Remove bookmark failed:', error);
    }
  };

  const isBookmarked = (eventId: string): boolean => {
    return bookmarks.some((b) => b.eventId === eventId && b.userId === user?.id);
  };

  const addRSVP = async (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number }
  ) => {
    if (!user || user.role !== 'student' || rsvps.some((r) => r.eventId === eventId && r.userId === user.id)) return;

    try {
      const response = await fetch('/api/registrations', buildRequestOptions({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, attendeeType, options }),
      }));

      if (!response.ok) {
        throw new Error('Failed to register for event');
      }

      const rsvp: RSVP = await response.json();
      setRSVPs((current) => [...current.filter((item) => !(item.eventId === eventId && item.userId === user.id)), rsvp]);
      setEvents((current) => current.map((event) => (
        event.id === eventId
          ? {
              ...event,
              rsvpCount: event.rsvpCount + 1,
              volunteersRegistered: attendeeType === 'volunteer'
                ? (event.volunteersRegistered || 0) + 1
                : event.volunteersRegistered,
              seatsBooked: options?.seatNumber ? (event.seatsBooked || 0) + 1 : event.seatsBooked,
            }
          : event
      )));
    } catch (error) {
      console.error('Add RSVP failed:', error);
    }
  };

  const removeRSVP = async (eventId: string) => {
    if (!user || user.role !== 'student') return;

    const existing = rsvps.find((r) => r.userId === user.id && r.eventId === eventId);
    if (!existing) return;

    try {
      const response = await fetch(`/api/registrations/${eventId}`, buildRequestOptions({
        method: 'DELETE',
      }));

      if (!response.ok) {
        throw new Error('Failed to unregister from event');
      }

      setRSVPs((current) => current.filter((r) => !(r.eventId === eventId && r.userId === user.id)));
      setEvents((current) => current.map((event) => (
        event.id === eventId
          ? {
              ...event,
              rsvpCount: Math.max(0, event.rsvpCount - 1),
              volunteersRegistered: existing.attendeeType === 'volunteer'
                ? Math.max(0, (event.volunteersRegistered || 0) - 1)
                : event.volunteersRegistered,
              seatsBooked: existing.seatNumber ? Math.max(0, (event.seatsBooked || 0) - 1) : event.seatsBooked,
            }
          : event
      )));
    } catch (error) {
      console.error('Remove RSVP failed:', error);
    }
  };

  const hasRSVP = (eventId: string): boolean => {
    return rsvps.some((r) => r.eventId === eventId && r.userId === user?.id);
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>): Promise<{ event: Event | null; error: string | null }> => {
    if (!user || user.role !== 'organizer') {
      return { event: null, error: 'You must be logged in as an organizer to create events.' };
    }

    const payload = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      category: eventData.category,
      image: eventData.image,
      capacity: eventData.seatingCapacity,
      registrationRequired: true,
      notes: eventData.notes,
      organizerId: user.id,
      status: eventData.status,
    };

    try {
      const response = await fetch('/api/events', buildRequestOptions({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }));

      if (!response.ok) {
        return {
          event: null,
          error: await getApiErrorMessage(response, 'Failed to create event'),
        };
      }

      const created = await response.json();
      const normalizedEvent = normalizeEvent(created);
      setEvents([...events, normalizedEvent]);
      return { event: normalizedEvent, error: null };
    } catch (error) {
      console.error('Create event failed:', error);
      return { event: null, error: 'Failed to create event' };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    const current = events.find((event) => event.id === eventId);
    if (!current) return;

    const merged = { ...current, ...updates };

    try {
      const response = await fetch(`/api/events/${eventId}`, buildRequestOptions({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: merged.title,
          description: merged.description,
          date: merged.date,
          startTime: merged.startTime,
          endTime: merged.endTime,
          location: merged.location,
          category: merged.category,
          image: merged.image,
          capacity: merged.seatingCapacity,
          registrationRequired: true,
          notes: merged.notes,
          status: merged.status,
        }),
      }));

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updated = await response.json();
      setEvents(events.map((event) => event.id === eventId ? normalizeEvent(updated) : event));
    } catch (error) {
      console.error('Update event failed:', error);
      setEvents(events.map((event) => event.id === eventId ? merged : event));
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, buildRequestOptions({
        method: 'DELETE',
      }));
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Delete event failed:', error);
    }

    setEvents(events.filter((event) => event.id !== eventId));
    setBookmarks(bookmarks.filter((bookmark) => bookmark.eventId !== eventId));
    setRSVPs(rsvps.filter((rsvp) => rsvp.eventId !== eventId));
  };

  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    try {
      const response = await fetch(`/api/events/${eventId}/status`, buildRequestOptions({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }));

      if (!response.ok) {
        throw new Error('Failed to update event status');
      }

      const updated = await response.json();
      setEvents((current) => current.map((event) => event.id === eventId ? normalizeEvent(updated) : event));
    } catch (error) {
      console.error('Update event status failed:', error);
      await loadEvents();
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setCurrentUser,
        login,
        logout,
        register,
        events,
        bookmarks,
        rsvps,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addRSVP,
        removeRSVP,
        hasRSVP,
        createEvent,
        updateEvent,
        updateEventStatus,
        deleteEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
