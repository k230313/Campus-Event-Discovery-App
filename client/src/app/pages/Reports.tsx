// ============================================
// File:    Reports.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Reports page for the frontend application.
// ============================================

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Users, Calendar, Download, FileText, Bookmark, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminOverview } from '../types/admin';
import { apiFetch } from '../services/api';

const REPORT_EXPORT_SLUGS: Record<string, string> = {
  'Event Summary Report': 'event-summary',
  'User Engagement Report': 'user-engagement',
  'Category Performance': 'category-performance',
  'Operational Snapshot': 'operational-snapshot',
};

/**
 * Renders the Reports component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function Reports() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingReport, setExportingReport] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Asynchronously executes the load overview logic.
     * @returns {*} Returns the resulting value.
     */
    async function loadOverview() {
      try {
        const response = await fetch('/api/admin/overview', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load report data');
        }

        const data = await response.json();
        setOverview(data);
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const totals = overview?.totals;
  const totalEvents = totals?.totalEvents ?? 0;
  const totalRegistrations = totals?.totalRegistrations ?? 0;
  const avgRegistrationsPerEvent = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : '0.0';

  const handleExport = async (title: string) => {
    const slug = REPORT_EXPORT_SLUGS[title];
    if (!slug) {
      return;
    }

    setExportingReport(title);
    setExportError(null);

    try {
      const response = await apiFetch(`/api/admin/reports/${slug}`);

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = `ceda-${slug}.csv`;
      const match = disposition?.match(/filename="([^"]+)"/);

      if (match?.[1]) {
        filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report export failed:', error);
      setExportError(`Failed to export ${title}. Please try again.`);
    } finally {
      setExportingReport(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <BarChart className="h-10 w-10 text-[#EF9B28]" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">Current summary based on live database records</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{totalEvents}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-[#1B2E55]/20" />
                </div>
                <p className="text-xs text-muted-foreground">{totals?.publishedEvents ?? 0} published, {totals?.pendingEvents ?? 0} pending</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Registrations</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{totalRegistrations}</p>
                  </div>
                  <Users className="h-12 w-12 text-[#EF9B28]/20" />
                </div>
                <p className="text-xs text-muted-foreground">{totals?.totalUsers ?? 0} total users</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Registrations/Event</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{avgRegistrationsPerEvent}</p>
                  </div>
                  <BarChart className="h-12 w-12 text-[#EF9B28]/20" />
                </div>
                <p className="text-xs text-muted-foreground">{totals?.draftEvents ?? 0} drafts, {totals?.rejectedEvents ?? 0} rejected</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Bookmarks</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{totals?.totalBookmarks ?? 0}</p>
                  </div>
                  <Bookmark className="h-12 w-12 text-[#1B2E55]/20" />
                </div>
                <p className="text-xs text-muted-foreground">{totals?.cancelledEvents ?? 0} cancelled events</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Available Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exportError && (
                  <p className="text-sm text-red-600 mb-2">{exportError}</p>
                )}
                {[
                  ['Event Summary Report', 'Current event and status summary'],
                  ['User Engagement Report', 'Registrations and bookmarks summary'],
                  ['Category Performance', 'Events by category'],
                  ['Operational Snapshot', 'Pending, draft, rejected, and cancelled counts'],
                ].map(([title, description]) => (
                  <div key={title} className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#1B2E55]" />
                      <div>
                        <p className="font-medium text-[#1B2E55]">{title}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportingReport !== null}
                      onClick={() => void handleExport(title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {exportingReport === title ? 'Exporting...' : 'Export'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Top Events (by registrations)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-muted-foreground mb-4">Loading report data...</p>}
                <div className="space-y-4">
                  {(overview?.topEvents || []).map((event, index) => (
                    <div key={event.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#EF9B28] rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1B2E55] text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1B2E55]">{event.rsvpCount}</p>
                        <p className="text-xs text-muted-foreground">registrations</p>
                      </div>
                    </div>
                  ))}
                  {!loading && (overview?.topEvents || []).length === 0 && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      No registration data available yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
