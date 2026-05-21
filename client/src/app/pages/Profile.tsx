// ============================================
// File:    Profile.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Profile page for the frontend application.
// ============================================

import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { User, Mail, Shield, Calendar, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { csrfFetch } from '../services/api';

/**
 * Renders the Profile component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function Profile() {
  const { user, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
    });
  }, [user]);

  /**
   * Asynchronously executes the handle save logic.
   * @returns {*} Returns the resulting value.
   */
  const handleSave = async () => {
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      const response = await csrfFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setProfileError(data?.error || 'Failed to update profile');
        return;
      }

      setCurrentUser(data);
      setFormData({ name: data.name, email: data.email });
      setProfileSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      setProfileError('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  /**
   * Asynchronously executes the handle password save logic.
   * @returns {*} Returns the resulting value.
   */
  const handlePasswordSave = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await csrfFetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPasswordError(data?.error || 'Failed to update password');
        return;
      }

      setPasswordSuccess(data?.message || 'Password updated successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Password update failed:', error);
      setPasswordError('Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-[#1B2E55]">Personal Information</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {profileSuccess}
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={`text-sm ${
                        user.role === 'admin'
                          ? 'bg-red-500/10 text-red-600 border-red-500'
                          : user.role === 'organizer'
                          ? 'bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]'
                          : 'bg-blue-500/10 text-blue-600 border-blue-500'
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSavingProfile}
                      className="bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({ name: user.name, email: user.email });
                        setProfileError('');
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Summary */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#1B2E55]/10 rounded-lg">
                      <User className="h-6 w-6 text-[#1B2E55]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-semibold text-[#1B2E55]">{user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#EF9B28]/10 rounded-lg">
                      <Mail className="h-6 w-6 text-[#EF9B28]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email Status</p>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#1B2E55]/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-[#1B2E55]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-semibold text-[#1B2E55]">May 2026</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Section */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle className="text-xl text-[#1B2E55] flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1B2E55]">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 2 months ago</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm((current) => !current);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>
                {passwordError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {passwordSuccess}
                  </div>
                )}
                {showPasswordForm && (
                  <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handlePasswordSave}
                      disabled={isSavingPassword}
                      className="bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                    >
                      {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1B2E55]">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
