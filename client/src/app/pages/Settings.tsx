import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Settings as SettingsIcon, Bell, Mail, Shield, Palette } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <SettingsIcon className="h-10 w-10 text-[#EF9B28]" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account preferences and settings</p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Settings saved successfully!</p>
            </div>
          )}

          {/* Notifications */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1B2E55] flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about events and activities
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get push notifications on your device
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="event-reminders" className="text-base">
                    Event Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded 24 hours before registered events
                  </p>
                </div>
                <Switch
                  id="event-reminders"
                  checked={eventReminders}
                  onCheckedChange={setEventReminders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest" className="text-base">
                    Weekly Digest
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of upcoming events
                  </p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1B2E55] flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base mb-2 block">Email Frequency</Label>
                <select className="w-full p-2 border-2 rounded-md">
                  <option>Immediate</option>
                  <option>Daily Digest</option>
                  <option>Weekly Digest</option>
                  <option>Never</option>
                </select>
              </div>
              <div>
                <Label className="text-base mb-2 block">Communication Language</Label>
                <select className="w-full p-2 border-2 rounded-md">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Chinese</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1B2E55] flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show RSVP Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see which events you're attending
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="mb-6 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1B2E55] flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base mb-2 block">Theme</Label>
                <select className="w-full p-2 border-2 rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#EF9B28] hover:bg-[#EF9B28]/90"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

