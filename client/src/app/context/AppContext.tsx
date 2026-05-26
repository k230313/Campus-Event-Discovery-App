// ============================================
// File:    AppContext.tsx
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Provides shared frontend state and API actions for auth, events, bookmarks, and registrations.
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Event, Bookmark, RSVP, EventAttendee } from '../types';
import { apiFetch, clearCsrfToken, csrfFetch } from '../services/api';
import { applyEventDeletionResult } from '../lib/eventUiState';

interface AppContextType {
  user: User | null;
  /**
   * Stores the authenticated user in React state and local storage.
   * @param {User | null} nextUser - Authenticated user to persist, or null to clear the session.
   * @returns {void} Does not return a value.
   */
  setCurrentUser: (nextUser: User | null) => void;
  /**
   * Authenticates a user with the backend and updates local session state.
   * @param {string} email - Email address submitted on the login form.
   * @param {string} password - Plain-text password submitted on the login form.
   * @returns {Promise<{ user: User | null; error: string | null }>} Login result containing either a user or an error.
   */
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  /**
   * Clears the current session both locally and on the backend.
   * @returns {void} Does not return a value.
   */
  logout: () => void;
  /**
   * Submits a new account registration request to the backend.
   * @param {string} name - Full name supplied during registration.
   * @param {string} email - Email address supplied during registration.
   * @param {string} password - Plain-text password supplied during registration.
   * @param {'student' | 'organizer'} role - Role selected by the new user.
   * @param {string} turnstileToken - Cloudflare Turnstile token for captcha verification.
   * @returns {Promise<{ user: User | null; message: string | null; error: string | null }>} Registration result message or error.
   */
  register: (name: string, email: string, password: string, role: 'student' | 'organizer', turnstileToken: string) => Promise<{ user: User | null; message: string | null; error: string | null }>;
  events: Event[];
  bookmarks: Bookmark[];
  rsvps: RSVP[];
  /**
   * Saves an event to the current user's bookmarks.
   * @param {string} eventId - Event identifier to bookmark.
   * @returns {Promise<void>} Resolves after the bookmark request finishes.
   */
  addBookmark: (eventId: string) => Promise<void>;
  /**
   * Removes an event from the current user's bookmarks.
   * @param {string} eventId - Event identifier to remove.
   * @returns {Promise<void>} Resolves after the bookmark is removed.
   */
  removeBookmark: (eventId: string) => Promise<void>;
  /**
   * Checks whether the current user has bookmarked an event.
   * @param {string} eventId - Event identifier to inspect.
   * @returns {boolean} True when the event is bookmarked.
   */
  isBookmarked: (eventId: string) => boolean;
  addRSVP: (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number; waitlistIfFull?: boolean }
  ) => Promise<{ confirmationEmailStatus: 'sent' | 'failed'; registrationStatus: 'registered' | 'waitlisted' }>;
  /**
   * Cancels the current student's registration for an event.
   * @param {string} eventId - Event identifier to unregister from.
   * @returns {Promise<{ success: boolean; error: string | null }>} Outcome of the cancellation flow.
   */
  removeRSVP: (eventId: string) => Promise<{ success: boolean; error: string | null }>;
  /**
   * Checks whether the current student already has a registration for an event.
   * @param {string} eventId - Event identifier to inspect.
   * @returns {boolean} True when the user has a matching registration entry.
   */
  hasRSVP: (eventId: string) => boolean;
  /**
   * Creates a new organizer event through the backend API.
   * @param {Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>} event - Event data captured from the creation form.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Created event or an error message.
   */
  createEvent: (event: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>) => Promise<{ event: Event | null; error: string | null }>;
  /**
   * Updates an existing event and synchronizes the local event list.
   * @param {string} eventId - Event identifier to update.
   * @param {Partial<Event>} updates - Partial event fields to merge and persist.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Updated event or an error message.
   */
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<{ event: Event | null; error: string | null }>;
  /**
   * Applies an admin moderation status change to an event.
   * @param {string} eventId - Event identifier to update.
   * @param {Event['status']} status - Target moderation status.
   * @param {string} [reviewNotes] - Optional approval note or rejection reason.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Updated event or an error message.
   */
  updateEventStatus: (eventId: string, status: Event['status'], reviewNotes?: string) => Promise<{ event: Event | null; error: string | null }>;
  /**
   * Deletes an event and removes its local references from related UI state.
   * @param {string} eventId - Event identifier to delete.
   * @returns {Promise<{ success: boolean; error: string | null }>} Outcome of the delete flow.
   */
  deleteEvent: (eventId: string) => Promise<{ success: boolean; error: string | null }>;
  /**
   * Loads the attendee list for an organizer-owned or admin-managed event.
   * @param {string} eventId - Event identifier to inspect.
   * @returns {Promise<{ eventTitle: string; attendees: EventAttendee[] }>} Event title and current attendee list.
   */
  getEventAttendees: (eventId: string) => Promise<{ eventTitle: string; attendees: EventAttendee[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'ceda_user';
const LEGACY_AUTH_TOKEN_KEY = 'ceda_auth_token';

/**
 * Normalizes an API event payload into the frontend event model.
 * @param {any} apiEvent - Raw event payload returned by the backend.
 * @returns {Event} Normalized event object used throughout the UI.
 */
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
    reviewNotes: apiEvent.reviewNotes ?? undefined,
    reviewedAt: apiEvent.reviewedAt ?? undefined,
    viewCount: Number(apiEvent.viewCount || 0),
    rsvpCount: Number(apiEvent.rsvpCount || 0),
    volunteersNeeded: apiEvent.volunteersNeeded ?? undefined,
    volunteersRegistered: apiEvent.volunteersRegistered ?? undefined,
    seatingCapacity: apiEvent.seatingCapacity ?? apiEvent.capacity ?? undefined,
    seatsBooked: apiEvent.seatsBooked ?? undefined,
    waitlistCount: apiEvent.waitlistCount ?? undefined,
    foodProvided: Boolean(apiEvent.foodProvided),
    foodOptions: apiEvent.foodOptions ?? undefined,
    notes: apiEvent.notes ?? undefined,
    createdAt: apiEvent.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes an API user payload into the frontend user model.
 * @param {any} apiUser - Raw user payload returned by the backend.
 * @returns {User} Normalized user object used throughout the UI.
 */
function normalizeUser(apiUser: any): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
  };
}

/**
 * Asynchronously extracts a readable error message from an API response body.
 * @param {Response} response - Fetch response returned by the backend.
 * @param {string} fallback - Fallback message to use when parsing fails.
 * @returns {Promise<string>} Best available user-facing error message.
 */
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

/**
 * Asynchronously performs an API request with a client-side timeout.
 * @param {RequestInfo | URL} input - Request target passed to fetch.
 * @param {number} timeoutMs - Timeout window in milliseconds.
 * @returns {Promise<Response>} API response when the request completes before timing out.
 */
async function fetchWithTimeout(input: RequestInfo | URL, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await apiFetch(input, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

/**
 * Renders the application context provider and exposes shared stateful actions to descendants.
 * @param {{ children: React.ReactNode }} props - Provider children that consume application state.
 * @returns {JSX.Element} Context provider wrapping the supplied children.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);

  /**
   * Updates the in-memory and persisted authenticated user state.
   * @param {User | null} nextUser - User object to persist, or null to clear it.
   * @returns {void} Does not return a value.
   */
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

  /**
   * Asynchronously loads the current event list from the backend.
   * @returns {Promise<void>} Resolves after the event list has been refreshed.
   */
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
    /**
     * Asynchronously loads bookmark and registration data for the current user.
     * @returns {Promise<void>} Resolves after user-specific data has been refreshed.
     */
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

  /**
   * Asynchronously logs a user in and stores the returned session user locally.
   * @param {string} email - Email address entered on the login form.
   * @param {string} password - Password entered on the login form.
   * @returns {Promise<{ user: User | null; error: string | null }>} Login result containing either a user or an error.
   */
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
      clearCsrfToken();
      setCurrentUser(nextUser);
      return { user: nextUser, error: null };
    } catch (error) {
      console.error('Login failed:', error);
      return { user: null, error: 'Failed to log in' };
    }
  };

  /**
   * Clears the local session and triggers the backend logout endpoint.
   * @returns {void} Does not return a value.
   */
  const logout = () => {
    csrfFetch('/api/auth/logout', { method: 'POST' }).catch((error) => {
      console.error('Logout request failed:', error);
    });
    setCurrentUser(null);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    clearCsrfToken();
    navigate('/login');
  };

  /**
   * Asynchronously registers a new account and returns the backend's confirmation message.
   * @param {string} name - Full name entered during registration.
   * @param {string} email - Email address entered during registration.
   * @param {string} password - Password entered during registration.
   * @param {'student' | 'organizer'} role - Role selected during registration.
   * @param {string} turnstileToken - Turnstile verification token from the client.
   * @returns {Promise<{ user: User | null; message: string | null; error: string | null }>} Registration message or error.
   */
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

  /**
   * Asynchronously creates a bookmark for the current user.
   * @param {string} eventId - Event identifier to bookmark.
   * @returns {Promise<void>} Resolves after the bookmark attempt completes.
   */
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

  /**
   * Asynchronously removes a bookmark for the current user.
   * @param {string} eventId - Event identifier to unbookmark.
   * @returns {Promise<void>} Resolves after the bookmark removal completes.
   */
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

  /**
   * Checks whether the current user has already bookmarked a given event.
   * @param {string} eventId - Event identifier to inspect.
   * @returns {boolean} True when the event is currently bookmarked.
   */
  const isBookmarked = (eventId: string): boolean => {
    return bookmarks.some((b) => b.eventId === eventId && b.userId === user?.id);
  };

  /**
   * Asynchronously registers the current student for an event or places them on the waitlist.
   * @param {string} eventId - Event identifier to register for.
   * @param {'attendee' | 'volunteer'} attendeeType - Registration type selected by the student.
   * @param {{ foodOption?: string; seatNumber?: number; waitlistIfFull?: boolean }} [options] - Optional registration details and waitlist preference.
   * @returns {Promise<{ confirmationEmailStatus: 'sent' | 'failed'; registrationStatus: 'registered' | 'waitlisted' }>} Registration status and attendee email result.
   */
  const addRSVP = async (
    eventId: string,
    attendeeType: 'attendee' | 'volunteer',
    options?: { foodOption?: string; seatNumber?: number; waitlistIfFull?: boolean }
  ) => {
    if (!user || user.role !== 'student') {
      throw new Error('Only students can register for events');
    }

    if (rsvps.some((r) => r.eventId === eventId && r.userId === user.id)) {
      throw new Error('You have already RSVP\'d to this event');
    }

    try {
      const { waitlistIfFull = false, ...registrationOptions } = options || {};
      const response = await csrfFetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, attendeeType, waitlistIfFull, options: registrationOptions }),
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
              rsvpCount: data.status === 'registered' ? event.rsvpCount + 1 : event.rsvpCount,
              volunteersRegistered: attendeeType === 'volunteer'
                ? data.status === 'registered'
                  ? (event.volunteersRegistered || 0) + 1
                  : event.volunteersRegistered
                : event.volunteersRegistered,
              seatsBooked: options?.seatNumber && data.status === 'registered'
                ? (event.seatsBooked || 0) + 1
                : event.seatsBooked,
            }
          : event
      )));
      return {
        confirmationEmailStatus: data.confirmationEmailStatus === 'sent' ? 'sent' : 'failed',
        registrationStatus: data.status === 'waitlisted' ? 'waitlisted' : 'registered',
      };
    } catch (error) {
      console.error('Add RSVP failed:', error);
      throw error;
    }
  };

  /**
   * Asynchronously cancels the current student's registration for an event.
   * @param {string} eventId - Event identifier to unregister from.
   * @returns {Promise<{ success: boolean; error: string | null }>} Outcome of the cancellation flow.
   */
  const removeRSVP = async (eventId: string): Promise<{ success: boolean; error: string | null }> => {
    if (!user || user.role !== 'student') {
      return { success: false, error: 'You must be logged in as a student to unregister.' };
    }

    const existing = rsvps.find((r) => r.userId === user.id && r.eventId === eventId);
    if (!existing) {
      return { success: false, error: 'Registration not found.' };
    }

    try {
      const response = await csrfFetch(`/api/registrations/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        return {
          success: false,
          error: await getApiErrorMessage(response, 'Failed to unregister from event'),
        };
      }

      setRSVPs((current) => current.filter((r) => !(r.eventId === eventId && r.userId === user.id)));
      setEvents((current) => current.map((event) => (
        event.id === eventId
          ? {
              ...event,
              rsvpCount: existing.status === 'registered' ? Math.max(0, event.rsvpCount - 1) : event.rsvpCount,
              volunteersRegistered: existing.attendeeType === 'volunteer' && existing.status === 'registered'
                ? Math.max(0, (event.volunteersRegistered || 0) - 1)
                : event.volunteersRegistered,
              seatsBooked: existing.seatNumber && existing.status === 'registered'
                ? Math.max(0, (event.seatsBooked || 0) - 1)
                : event.seatsBooked,
            }
          : event
      )));
      return { success: true, error: null };
    } catch (error) {
      console.error('Remove RSVP failed:', error);
      return { success: false, error: 'Failed to unregister from event' };
    }
  };

  /**
   * Checks whether the current student already has a registration for an event.
   * @param {string} eventId - Event identifier to inspect.
   * @returns {boolean} True when the user has a matching registration entry.
   */
  const hasRSVP = (eventId: string): boolean => {
    return rsvps.some((r) => r.eventId === eventId && r.userId === user?.id);
  };

  /**
   * Asynchronously submits a new organizer event to the backend.
   * @param {Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'viewCount' | 'rsvpCount' | 'createdAt'>} eventData - Event data collected from the creation form.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Created event or an error message.
   */
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

  /**
   * Asynchronously updates an existing event and refreshes the local list with the saved version.
   * @param {string} eventId - Event identifier to update.
   * @param {Partial<Event>} updates - Partial event data to merge before saving.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Updated event or an error message.
   */
  const updateEvent = async (eventId: string, updates: Partial<Event>): Promise<{ event: Event | null; error: string | null }> => {
    const current = events.find((event) => event.id === eventId);
    if (!current) {
      return { event: null, error: 'Event not found' };
    }

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
        return {
          event: null,
          error: await getApiErrorMessage(response, 'Failed to update event'),
        };
      }

      const updated = await response.json();
      const normalizedEvent = normalizeEvent(updated);
      setEvents(events.map((event) => event.id === eventId ? normalizedEvent : event));
      return { event: normalizedEvent, error: null };
    } catch (error) {
      console.error('Update event failed:', error);
      return { event: null, error: 'Failed to update event' };
    }
  };

  /**
   * Asynchronously deletes an event and removes its related local state entries.
   * @param {string} eventId - Event identifier to delete.
   * @returns {Promise<{ success: boolean; error: string | null }>} Outcome of the delete flow.
   */
  const deleteEvent = async (eventId: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        return {
          success: false,
          error: await getApiErrorMessage(response, 'Failed to delete event'),
        };
      }

      const nextState = applyEventDeletionResult({ events, bookmarks, rsvps }, eventId, true);
      setEvents(nextState.events);
      setBookmarks(nextState.bookmarks);
      setRSVPs(nextState.rsvps);
      return { success: true, error: null };
    } catch (error) {
      console.error('Delete event failed:', error);
      return { success: false, error: 'Failed to delete event' };
    }
  };

  /**
   * Asynchronously fetches the attendee list for a specific organizer/admin event view.
   * @param {string} eventId - Event identifier whose attendee list should be loaded.
   * @returns {Promise<{ eventTitle: string; attendees: EventAttendee[] }>} Event title and attendee collection.
   */
  const getEventAttendees = async (eventId: string) => {
    const response = await apiFetch(`/api/registrations/events/${eventId}/attendees`);

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, 'Failed to fetch event attendees'));
    }

    const data = await response.json();
    return {
      eventTitle: data.eventTitle,
      attendees: Array.isArray(data.attendees) ? data.attendees : [],
    };
  };

  /**
   * Asynchronously updates an event's moderation status from the admin UI.
   * @param {string} eventId - Event identifier to update.
   * @param {Event['status']} status - Next moderation status to apply.
   * @param {string} [reviewNotes] - Optional approval note or rejection reason.
   * @returns {Promise<{ event: Event | null; error: string | null }>} Updated event or an error message.
   */
  const updateEventStatus = async (eventId: string, status: Event['status'], reviewNotes?: string): Promise<{ event: Event | null; error: string | null }> => {
    try {
      const response = await csrfFetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes }),
      });

      if (!response.ok) {
        return {
          event: null,
          error: await getApiErrorMessage(response, 'Failed to update event status'),
        };
      }

      const updated = await response.json();
      const normalizedEvent = normalizeEvent(updated);
      setEvents((current) => current.map((event) => event.id === eventId ? normalizedEvent : event));
      return { event: normalizedEvent, error: null };
    } catch (error) {
      console.error('Update event status failed:', error);
      await loadEvents();
      return { event: null, error: 'Failed to update event status' };
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
        getEventAttendees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Returns the shared application context and enforces provider usage.
 * @returns {AppContextType} Shared application state and actions.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
