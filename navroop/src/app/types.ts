// Types for the Campus Event Discovery App

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
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
  status: 'draft' | 'published' | 'cancelled';
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

export type EventCategory =
  | 'Academic'
  | 'Social'
  | 'Career'
  | 'Club'
  | 'Workshop'
  | 'Other';

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
