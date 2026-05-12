import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users, Bookmark, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminOverview } from '../types/admin';

export function AdminDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await fetch('/api/admin/overview', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load admin overview');
        }

        const data = await response.json();
        setOverview(data);
      } catch (error) {
        console.error('Failed to load admin overview:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const totals = overview?.totals;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">System overview based on current database records</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Events</p>
                    <p className="text-4xl font-bold">{totals?.totalEvents ?? 0}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">{totals?.publishedEvents ?? 0} published, {totals?.pendingEvents ?? 0} pending</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Users</p>
                    <p className="text-4xl font-bold">{totals?.totalUsers ?? 0}</p>
                  </div>
                  <Users className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">{totals?.totalStudents ?? 0} students, {totals?.totalOrganizers ?? 0} organizers</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Registrations</p>
                    <p className="text-4xl font-bold">{totals?.totalRegistrations ?? 0}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">{totals?.draftEvents ?? 0} drafts, {totals?.rejectedEvents ?? 0} rejected</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Bookmarks</p>
                    <p className="text-4xl font-bold">{totals?.totalBookmarks ?? 0}</p>
                  </div>
                  <Bookmark className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">{totals?.cancelledEvents ?? 0} cancelled, {totals?.totalAdmins ?? 0} admins</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-muted-foreground mb-4">Loading overview...</p>}
                <div className="space-y-4">
                  {(overview?.recentEvents || []).map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-[#1B2E55]">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.rsvpCount} registrations</p>
                        <p className="text-xs text-muted-foreground">{event.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(overview?.categoryDistribution || []).map((category) => {
                    const count = category.eventCount;
                    const totalEvents = totals?.totalEvents || 0;
                    const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#1B2E55]">{category.name}</span>
                          <span className="text-sm text-muted-foreground">{count} events</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#EF9B28] h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
