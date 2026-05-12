import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Event, Bookmark, RSVP } from '../types';
import { mockEvents, mockUser } from '../data/mockData';

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
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  useEffect(() => {
    // Auto-login for demo purposes
    const savedUser = localStorage.getItem('ceda_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (email && password) {
      const userData = mockUser;
      setUser(userData);
      localStorage.setItem('ceda_user', JSON.stringify(userData));
      return true;
    }
    return false;
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
    // Mock registration
    if (name && email && password) {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
      };
      setUser(newUser);
      localStorage.setItem('ceda_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const addBookmark = (eventId: string) => {
    if (!user) return;
    const bookmark: Bookmark = {
      userId: user.id,
      eventId,
      savedAt: new Date().toISOString(),
    };
    setBookmarks([...bookmarks, bookmark]);
  };

  const removeBookmark = (eventId: string) => {
    setBookmarks(bookmarks.filter(b => !(b.eventId === eventId && b.userId === user?.id)));
  };

  const isBookmarked = (eventId: string): boolean => {
    return bookmarks.some(b => b.eventId === eventId && b.userId === user?.id);
  };

  const addRSVP = (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number }
  ) => {
    if (!user) return;
    const rsvp: RSVP = {
      userId: user.id,
      eventId,
      attendeeType,
      selectedFoodOption: options?.foodOption,
      seatNumber: options?.seatNumber,
      createdAt: new Date().toISOString(),
    };
    setRSVPs([...rsvps, rsvp]);

    // Update event stats
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          rsvpCount: e.rsvpCount + 1,
          volunteersRegistered: attendeeType === 'volunteer' ? (e.volunteersRegistered || 0) + 1 : e.volunteersRegistered,
          seatsBooked: options?.seatNumber ? (e.seatsBooked || 0) + 1 : e.seatsBooked,
        };
      }
      return e;
    }));
  };

  const removeRSVP = (userId: string, eventId: string) => {
    const rsvp = rsvps.find(r => r.eventId === eventId && r.userId === userId);
    if (!rsvp) return;

    setRSVPs(rsvps.filter(r => !(r.eventId === eventId && r.userId === userId)));

    // Update event stats
    setEvents(events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          rsvpCount: Math.max(0, e.rsvpCount - 1),
          volunteersRegistered: rsvp.attendeeType === 'volunteer' ? Math.max(0, (e.volunteersRegistered || 0) - 1) : e.volunteersRegistered,
          seatsBooked: rsvp.seatNumber ? Math.max(0, (e.seatsBooked || 0) - 1) : e.seatsBooked,
        };
      }
      return e;
    }));
  };

  const hasRSVP = (eventId: string): boolean => {
    return rsvps.some(r => r.eventId === eventId && r.userId === user?.id);
  };

  const createEvent = (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => {
    if (!user || user.role !== 'organizer') return;

    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      organizerId: user.id,
      organizerName: user.name,
      viewCount: 0,
      rsvpCount: 0,
      createdAt: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, ...updates } : e));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    // Also remove associated bookmarks and RSVPs
    setBookmarks(bookmarks.filter(b => b.eventId !== eventId));
    setRSVPs(rsvps.filter(r => r.eventId !== eventId));
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
