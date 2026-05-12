import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users, Eye, TrendingUp, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user, events } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;
  const totalRSVPs = events.reduce((sum, e) => sum + e.rsvpCount, 0);
  const totalViews = events.reduce((sum, e) => sum + e.viewCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Shield className="h-10 w-10 text-red-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">System overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Events</p>
                    <p className="text-4xl font-bold">{totalEvents}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">{publishedEvents} published</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Users</p>
                    <p className="text-4xl font-bold">523</p>
                  </div>
                  <Users className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">15 new this week</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total RSVPs</p>
                    <p className="text-4xl font-bold">{totalRSVPs}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">↑ 12% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-white/80 mb-1">Total Views</p>
                    <p className="text-4xl font-bold">{totalViews}</p>
                  </div>
                  <Eye className="h-12 w-12 text-white/30" />
                </div>
                <p className="text-xs text-white/70">↑ 8% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-[#1B2E55]">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.rsvpCount} RSVPs</p>
                        <p className="text-xs text-muted-foreground">{event.viewCount} views</p>
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
                  {['Academic', 'Social', 'Career', 'Club', 'Workshop', 'Other'].map((category) => {
                    const count = events.filter((e) => e.category === category).length;
                    const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#1B2E55]">{category}</span>
                          <span className="text-sm text-muted-foreground">{count} events</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#EF9B28] h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
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

