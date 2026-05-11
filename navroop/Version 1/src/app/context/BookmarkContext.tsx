import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface BookmarkContextType {
  bookmarks: Set<string>;
  toggleBookmark: (eventId: string) => void;
  isBookmarked: (eventId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load bookmarks from localStorage when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`bookmarks_${user.id}`);
      if (stored) {
        setBookmarks(new Set(JSON.parse(stored)));
      } else {
        setBookmarks(new Set());
      }
    } else {
      setBookmarks(new Set());
    }
  }, [user]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (user && bookmarks.size >= 0) {
      localStorage.setItem(`bookmarks_${user.id}`, JSON.stringify(Array.from(bookmarks)));
    }
  }, [bookmarks, user]);

  const toggleBookmark = (eventId: string) => {
    if (!user) return;

    setBookmarks((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(eventId)) {
        newBookmarks.delete(eventId);
      } else {
        newBookmarks.add(eventId);
      }
      return newBookmarks;
    });
  };

  const isBookmarked = (eventId: string) => {
    return bookmarks.has(eventId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
