import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { RSVP } from '../types';

interface RSVPContextType {
  rsvps: RSVP[];
  addRSVP: (eventId: string, details?: Partial<RSVP>) => void;
  cancelRSVP: (eventId: string) => void;
  getRSVPForEvent: (eventId: string) => RSVP | undefined;
  isRSVPed: (eventId: string) => boolean;
}

const RSVPContext = createContext<RSVPContextType | undefined>(undefined);

export function RSVPProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  // Load RSVPs from localStorage when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`rsvps_${user.id}`);
      if (stored) {
        setRsvps(JSON.parse(stored));
      } else {
        setRsvps([]);
      }
    } else {
      setRsvps([]);
    }
  }, [user]);

  // Save RSVPs to localStorage whenever they change
  useEffect(() => {
    if (user && rsvps.length >= 0) {
      localStorage.setItem(`rsvps_${user.id}`, JSON.stringify(rsvps));
    }
  }, [rsvps, user]);

  const addRSVP = (eventId: string, details?: Partial<RSVP>) => {
    if (!user) return;

    const newRSVP: RSVP = {
      id: `rsvp_${Date.now()}`,
      userId: user.id,
      eventId,
      status: 'attending',
      createdAt: new Date().toISOString(),
      ...details,
    };

    setRsvps((prev) => {
      const filtered = prev.filter((r) => r.eventId !== eventId);
      return [...filtered, newRSVP];
    });
  };

  const cancelRSVP = (eventId: string) => {
    setRsvps((prev) => prev.filter((r) => r.eventId !== eventId));
  };

  const getRSVPForEvent = (eventId: string) => {
    return rsvps.find((r) => r.eventId === eventId);
  };

  const isRSVPed = (eventId: string) => {
    return rsvps.some((r) => r.eventId === eventId && r.status === 'attending');
  };

  return (
    <RSVPContext.Provider value={{ rsvps, addRSVP, cancelRSVP, getRSVPForEvent, isRSVPed }}>
      {children}
    </RSVPContext.Provider>
  );
}

export function useRSVP() {
  const context = useContext(RSVPContext);
  if (context === undefined) {
    throw new Error('useRSVP must be used within an RSVPProvider');
  }
  return context;
}
