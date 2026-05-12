import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Event, Bookmark, RSVP } from '../types';
import { mockEvents } from '../data/mockData';

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'organizer') => Promise<User | null>;
  events: Event[];
  bookmarks: Bookmark[];
  rsvps: RSVP[];
  addBookmark: (eventId: string) => Promise<void>;
  removeBookmark: (eventId: string) => Promise<void>;
  isBookmarked: (eventId: string) => boolean;
  addRSVP: (eventId: string, attendeeType: 'attendee' | 'volunteer', options?: { foodOption?: string; seatNumber?: number }) => Promise<void>;
  removeRSVP: (eventId: string) => Promise<void>;
  hasRSVP: (eventId: string) => boolean;
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  updateEventStatus: (eventId: string, status: Event['status']) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = 'ceda_auth_token';
const USER_STORAGE_KEY = 'ceda_user';

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
    organizerName: apiEvent.organizerName || 'Kent Institute',
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

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const savedBookmarks = localStorage.getItem('ceda_bookmarks');
    const savedRsvps = localStorage.getItem('ceda_rsvps');
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    if (savedRsvps) {
      setRSVPs(JSON.parse(savedRsvps));
    }

    if (savedToken) {
      fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to restore session');
          }
          return response.json();
        })
        .then((data) => {
          const nextUser = normalizeUser(data.user);
          setUser(nextUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
        });
    }
  }, []);

  async function loadEvents() {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.map(normalizeEvent));
    } catch (error) {
      console.error('Failed to load events from API, using mock data:', error);
      setEvents(mockEvents);
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
        if (user.role === 'student') {
          const [bookmarkResponse, registrationResponse] = await Promise.all([
            fetch('/api/bookmarks', { headers: getAuthHeaders() }),
            fetch('/api/registrations', { headers: getAuthHeaders() }),
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const nextUser = normalizeUser(data.user);
      setUser(nextUser);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      return nextUser;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'organizer'
  ): Promise<User | null> => {
    if (!name || !email || !password) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const nextUser = normalizeUser(data.user);
      setUser(nextUser);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      return nextUser;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  };

  const addBookmark = async (eventId: string) => {
    if (!user || user.role !== 'student' || bookmarks.some((b) => b.eventId === eventId && b.userId === user.id)) return;

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ eventId }),
      });

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
    if (!user || user.role !== 'student') return;

    try {
      const response = await fetch(`/api/bookmarks/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

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
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ eventId, attendeeType, options }),
      });

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
      const response = await fetch(`/api/registrations/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

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

  const createEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => {
    if (!user || user.role !== 'organizer') return;

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
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const created = await response.json();
      setEvents([...events, normalizeEvent(created)]);
    } catch (error) {
      console.error('Create event failed:', error);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    const current = events.find((event) => event.id === eventId);
    if (!current) return;

    const merged = { ...current, ...updates };

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
      });

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
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
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
      const response = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });

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
