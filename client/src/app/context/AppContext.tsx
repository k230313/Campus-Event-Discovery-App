import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Event, Bookmark, RSVP } from '../types';
import { mockEvents } from '../data/mockData';

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'student' | 'organizer' | 'admin') => Promise<boolean>;
  events: Event[];
  bookmarks: Bookmark[];
  rsvps: RSVP[];
  addBookmark: (eventId: string) => void;
  removeBookmark: (eventId: string) => void;
  isBookmarked: (eventId: string) => boolean;
  addRSVP: (eventId: string, attendeeType: 'attendee' | 'volunteer', options?: { foodOption?: string; seatNumber?: number }) => void;
  removeRSVP: (userId: string, eventId: string) => void;
  hasRSVP: (eventId: string) => boolean;
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function inferRole(email: string): User['role'] {
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('organizer') || lower.includes('organiser') || lower.includes('staff') || lower.includes('services')) {
    return 'organizer';
  }
  return 'student';
}

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

function makeDemoUser(name: string, email: string, role?: User['role']): User {
  return {
    id: role === 'admin' ? '1' : role === 'organizer' ? '2' : '3',
    name,
    email,
    role: role || inferRole(email),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ceda_user');
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
  }, []);

  useEffect(() => {
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

    loadEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('ceda_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ceda_rsvps', JSON.stringify(rsvps));
  }, [rsvps]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      return false;
    }

    const role = inferRole(email);
    const nextUser = makeDemoUser(email.split('@')[0], email, role);
    setUser(nextUser);
    localStorage.setItem('ceda_user', JSON.stringify(nextUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ceda_user');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'organizer' | 'admin'
  ): Promise<boolean> => {
    if (!name || !email || !password) {
      return false;
    }

    const nextUser = makeDemoUser(name, email, role);
    setUser(nextUser);
    localStorage.setItem('ceda_user', JSON.stringify(nextUser));
    return true;
  };

  const addBookmark = (eventId: string) => {
    if (!user || bookmarks.some((b) => b.eventId === eventId && b.userId === user.id)) return;
    setBookmarks([...bookmarks, { userId: user.id, eventId, savedAt: new Date().toISOString() }]);
  };

  const removeBookmark = (eventId: string) => {
    setBookmarks(bookmarks.filter((b) => !(b.eventId === eventId && b.userId === user?.id)));
  };

  const isBookmarked = (eventId: string): boolean => {
    return bookmarks.some((b) => b.eventId === eventId && b.userId === user?.id);
  };

  const addRSVP = (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number }
  ) => {
    if (!user || rsvps.some((r) => r.eventId === eventId && r.userId === user.id)) return;

    const rsvp: RSVP = {
      userId: user.id,
      eventId,
      attendeeType,
      selectedFoodOption: options?.foodOption,
      seatNumber: options?.seatNumber,
      createdAt: new Date().toISOString(),
    };

    setRSVPs([...rsvps, rsvp]);
    setEvents(events.map((event) => (
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
  };

  const removeRSVP = (userId: string, eventId: string) => {
    const existing = rsvps.find((r) => r.userId === userId && r.eventId === eventId);
    if (!existing) return;

    setRSVPs(rsvps.filter((r) => !(r.eventId === eventId && r.userId === userId)));
    setEvents(events.map((event) => (
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
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
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
