import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Event, Bookmark, RSVP } from '../types';
import { apiFetch, clearCsrfToken, csrfFetch } from '../services/api';

interface AppContextType {
  user: User | null;
  setCurrentUser: (nextUser: User | null) => void;
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'organizer', turnstileToken: string) => Promise<{ user: User | null; message: string | null; error: string | null }>;
  events: Event[];
  bookmarks: Bookmark[];
  rsvps: RSVP[];
  addBookmark: (eventId: string) => Promise<void>;
  removeBookmark: (eventId: string) => Promise<void>;
  isBookmarked: (eventId: string) => boolean;
  addRSVP: (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number }
  ) => Promise<{ confirmationEmailStatus: 'sent' | 'failed' }>;
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

async function fetchWithTimeout(input: RequestInfo | URL, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await apiFetch(input, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
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

    apiFetch('/api/auth/me')
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
      const response = await apiFetch('/api/events');
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
          const [bookmarkResult, registrationResult] = await Promise.allSettled([
            fetchWithTimeout('/api/bookmarks'),
            fetchWithTimeout('/api/registrations'),
          ]);

          if (bookmarkResult.status === 'fulfilled') {
            if (bookmarkResult.value.ok) {
              const bookmarkData = await bookmarkResult.value.json();
              setBookmarks(bookmarkData);
            } else {
              setBookmarks([]);
            }
          } else {
            console.error('[AppContext] Bookmarks fetch failed:', bookmarkResult.reason);
            setBookmarks([]);
          }

          if (registrationResult.status === 'fulfilled') {
            if (registrationResult.value.ok) {
              const registrationData = await registrationResult.value.json();
              setRSVPs(registrationData);
            } else {
              setRSVPs([]);
            }
          } else {
            console.error('[AppContext] Registrations fetch failed:', registrationResult.reason);
            setRSVPs([]);
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

  const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    if (!email || !password) {
      return { user: null, error: 'Email and password are required' };
    }

    try {
      const response = await csrfFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return {
          user: null,
          error: await getApiErrorMessage(response, 'Failed to log in'),
        };
      }

      const data = await response.json();
      const nextUser = normalizeUser(data.user);
      setCurrentUser(nextUser);
      return { user: nextUser, error: null };
    } catch (error) {
      console.error('Login failed:', error);
      return { user: null, error: 'Failed to log in' };
    }
  };

  const logout = () => {
    csrfFetch('/api/auth/logout', { method: 'POST' }).catch((error) => {
      console.error('Logout request failed:', error);
    });
    setCurrentUser(null);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    clearCsrfToken();
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'organizer',
    turnstileToken: string
  ): Promise<{ user: User | null; message: string | null; error: string | null }> => {
    if (!name || !email || !password || !turnstileToken) {
      return { user: null, message: null, error: 'All fields are required' };
    }

    try {
      const response = await csrfFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, turnstileToken }),
      });

      if (!response.ok) {
        return {
          user: null,
          message: null,
          error: await getApiErrorMessage(response, 'Registration failed'),
        };
      }

      const data = await response.json();
      return { user: null, message: data.message || null, error: null };
    } catch (error) {
      console.error('Registration failed:', error);
      return { user: null, message: null, error: 'Registration failed' };
    }
  };

  const addBookmark = async (eventId: string) => {
    if (!user || (user.role !== 'student' && user.role !== 'organizer') || bookmarks.some((b) => b.eventId === eventId && b.userId === user.id)) return;

    try {
      const response = await csrfFetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    if (!user || (user.role !== 'student' && user.role !== 'organizer')) return;

    try {
      const response = await csrfFetch(`/api/bookmarks/${eventId}`, {
        method: 'DELETE',
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
    if (!user || user.role !== 'student') {
      throw new Error('Only students can register for events');
    }

    if (rsvps.some((r) => r.eventId === eventId && r.userId === user.id)) {
      throw new Error('You have already RSVP\'d to this event');
    }

    try {
      const response = await csrfFetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, attendeeType, options }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to register for event'));
      }

      const data = await response.json();
      const rsvp: RSVP = data;
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
      return {
        confirmationEmailStatus: data.confirmationEmailStatus === 'sent' ? 'sent' : 'failed',
      };
    } catch (error) {
      console.error('Add RSVP failed:', error);
      throw error;
    }
  };

  const removeRSVP = async (eventId: string) => {
    if (!user || user.role !== 'student') return;

    const existing = rsvps.find((r) => r.userId === user.id && r.eventId === eventId);
    if (!existing) return;

    try {
      const response = await csrfFetch(`/api/registrations/${eventId}`, {
        method: 'DELETE',
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
      const response = await csrfFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

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
      const response = await csrfFetch(`/api/events/${eventId}`, {
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
      const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
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
      const response = await csrfFetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
