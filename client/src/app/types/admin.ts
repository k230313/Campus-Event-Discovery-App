// ============================================
// File:    admin.ts
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Defines TypeScript types for admin.
// ============================================

export interface AdminOverview {
  totals: {
    totalUsers: number;
    totalStudents: number;
    totalOrganizers: number;
    totalAdmins: number;
    totalEvents: number;
    publishedEvents: number;
    pendingEvents: number;
    draftEvents: number;
    rejectedEvents: number;
    cancelledEvents: number;
    totalRegistrations: number;
    totalBookmarks: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
    rsvpCount: number;
  }>;
  categoryDistribution: Array<{
    id: string;
    name: string;
    eventCount: number;
  }>;
  topEvents: Array<{
    id: string;
    title: string;
    category: string;
    rsvpCount: number;
  }>;
}
