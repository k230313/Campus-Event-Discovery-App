// Types for the Campus Event Discovery App

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  eventCount?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  image?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'cancelled';
  viewCount: number;
  rsvpCount: number;
  volunteersNeeded?: number;
  volunteersRegistered?: number;
  seatingCapacity?: number;
  seatsBooked?: number;
  foodProvided?: boolean;
  foodOptions?: string[];
  notes?: string;
  createdAt: string;
}

export type EventCategory = string;

export interface Bookmark {
  userId: string;
  eventId: string;
  savedAt: string;
}

export interface RSVP {
  userId: string;
  eventId: string;
  attendeeType: 'attendee' | 'volunteer';
  selectedFoodOption?: string;
  seatNumber?: number;
  createdAt: string;
}
