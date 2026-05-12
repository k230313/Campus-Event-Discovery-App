import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, TrendingUp, Users, Calendar, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Reports() {
  const { user, events } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const totalEvents = events.length;
  const totalRSVPs = events.reduce((sum, e) => sum + e.rsvpCount, 0);
  const totalViews = events.reduce((sum, e) => sum + e.viewCount, 0);
  const avgRSVPsPerEvent = totalEvents > 0 ? (totalRSVPs / totalEvents).toFixed(1) : 0;

  const handleExport = (type: string) => {
    alert(`Exporting ${type} report...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <BarChart className="h-10 w-10 text-[#EF9B28]" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">Comprehensive platform insights and analytics</p>
          </div>

          {/* Key Metrics */}
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
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ↑ 15% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total RSVPs</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{totalRSVPs}</p>
                  </div>
                  <Users className="h-12 w-12 text-[#EF9B28]/20" />
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ↑ 22% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg RSVPs/Event</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{avgRSVPsPerEvent}</p>
                  </div>
                  <BarChart className="h-12 w-12 text-[#EF9B28]/20" />
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ↑ 8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                    <p className="text-4xl font-bold text-[#1B2E55]">{totalViews}</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-[#1B2E55]/20" />
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ↑ 18% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Report Types */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Available Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1B2E55]" />
                    <div>
                      <p className="font-medium text-[#1B2E55]">Event Summary Report</p>
                      <p className="text-sm text-muted-foreground">All events with statistics</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('Event Summary')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1B2E55]" />
                    <div>
                      <p className="font-medium text-[#1B2E55]">User Engagement Report</p>
                      <p className="text-sm text-muted-foreground">RSVP and attendance data</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('User Engagement')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1B2E55]" />
                    <div>
                      <p className="font-medium text-[#1B2E55]">Category Performance</p>
                      <p className="text-sm text-muted-foreground">Events by category analysis</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('Category Performance')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F0F3F9] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1B2E55]" />
                    <div>
                      <p className="font-medium text-[#1B2E55]">Monthly Trends</p>
                      <p className="text-sm text-muted-foreground">Month-over-month comparison</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('Monthly Trends')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl text-[#1B2E55]">Top Events (by RSVPs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events
                    .sort((a, b) => b.rsvpCount - a.rsvpCount)
                    .slice(0, 5)
                    .map((event, index) => (
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
                          <p className="text-xs text-muted-foreground">RSVPs</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
