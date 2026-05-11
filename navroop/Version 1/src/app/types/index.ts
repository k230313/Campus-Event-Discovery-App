// User types
export type UserRole = 'student' | 'organiser';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  organiserId: string;
  organiserName: string;
  status: EventStatus;
  viewCount: number;
  rsvpCount: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  // Enhanced fields
  images?: EventImage[];
  thumbnailUrl?: string;
  volunteering?: VolunteerInfo;
  seating?: SeatingInfo;
  food?: FoodInfo;
  capacity?: number;
  registrationRequired?: boolean;
  tags?: string[];
}

export interface EventImage {
  id: string;
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
}

export interface VolunteerInfo {
  needed: boolean;
  positions?: VolunteerPosition[];
  totalSpots?: number;
  filledSpots?: number;
}

export interface VolunteerPosition {
  id: string;
  title: string;
  description: string;
  spots: number;
  filledSpots: number;
  requirements?: string[];
}

export interface SeatingInfo {
  available: boolean;
  type?: 'assigned' | 'first-come' | 'open';
  capacity?: number;
  remaining?: number;
  layout?: string;
  accessibility?: boolean;
}

export interface FoodInfo {
  provided: boolean;
  type?: 'full-meal' | 'refreshments' | 'snacks' | 'none';
  menu?: string[];
  dietaryOptions?: string[];
  cost?: number;
}

export type EventCategory = 'Academic' | 'Social' | 'Career' | 'Club' | 'Workshop' | 'Other';
export type EventStatus = 'draft' | 'published' | 'cancelled';

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  eventId: string;
  savedAt: string;
}

// RSVP types
export interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  status: 'attending' | 'maybe' | 'cancelled';
  createdAt: string;
  seatingPreference?: string;
  dietaryRestrictions?: string[];
  volunteerPositions?: string[];
}

// Filter types
export interface EventFilters {
  category?: EventCategory;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  searchQuery?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}
