import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Users, Search, Shield, UserX, Mail, Edit2, X, Lock, LockOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface EditingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function ManageUsers() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<EditingUser & { joinedDate: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockToken, setUnlockToken] = useState('');
  const [unlockExpiresAt, setUnlockExpiresAt] = useState<number | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [now, setNow] = useState(Date.now());

  const clearUnlockState = () => {
    setIsUnlocked(false);
    setUnlockToken('');
    setUnlockExpiresAt(null);
    setMasterPassword('');
    setUnlockError('');
    setShowDeleteConfirm(null);
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/api/users', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    if (!unlockExpiresAt) {
      return undefined;
    }

    const remainingMs = unlockExpiresAt - Date.now();
    if (remainingMs <= 0) {
      clearUnlockState();
      return undefined;
    }

    const expiryTimer = window.setTimeout(() => {
      clearUnlockState();
    }, remainingMs);

    const ticker = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      window.clearTimeout(expiryTimer);
      window.clearInterval(ticker);
    };
  }, [unlockExpiresAt]);

  const isUnlockExpired = Boolean(unlockExpiresAt && unlockExpiresAt <= now);
  const deletionUnlocked = isUnlocked && !isUnlockExpired && Boolean(unlockToken);
  const minutesRemaining = unlockExpiresAt
    ? Math.max(0, Math.ceil((unlockExpiresAt - now) / 60000))
    : 0;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (u: typeof users[number]) => {
    setEditingUser({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers((current) => current.map((entry) => entry.id === updatedUser.id ? updatedUser : entry));
      setEditingUser(null);
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleUnlockDeletion = async () => {
    if (!masterPassword) {
      setUnlockError('Master password is required.');
      return;
    }

    setIsUnlocking(true);
    setUnlockError('');

    try {
      const response = await fetch('/api/admin/unlock', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.unlockToken) {
        setUnlockError(data?.error || 'Failed to unlock user deletion.');
        return;
      }

      const expiry = Date.now() + 30 * 60 * 1000;
      setUnlockToken(data.unlockToken);
      setUnlockExpiresAt(expiry);
      setIsUnlocked(true);
      setNow(Date.now());
      setMasterPassword('');
      setUnlockError('');
      setShowUnlockDialog(false);
    } catch (error) {
      setUnlockError('Failed to unlock user deletion.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!deletionUnlocked) {
      setShowUnlockDialog(true);
      return;
    }

    if (showDeleteConfirm === userId) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Authorization: `Unlock ${unlockToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            clearUnlockState();
            setShowUnlockDialog(true);
          }
          throw new Error('Failed to delete user');
        }

        setUsers((current) => current.filter((entry) => entry.id !== userId));
        setShowDeleteConfirm(null);
      } catch (error) {
        alert(`Failed to delete "${userName}".`);
      }
    } else {
      setShowDeleteConfirm(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2 flex items-center gap-3">
              <Users className="h-10 w-10 text-[#EF9B28]" />
              Manage Users
            </h1>
            <p className="text-muted-foreground">View and manage all platform users</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[#1B2E55]">{users.length}</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Students</p>
                <p className="text-3xl font-bold text-blue-600">
                  {users.filter((u) => u.role === 'student').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Organizers</p>
                <p className="text-3xl font-bold text-[#EF9B28]">
                  {users.filter((u) => u.role === 'organizer').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant={deletionUnlocked ? 'secondary' : 'outline'}
                  className={deletionUnlocked ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                  onClick={() => {
                    if (isUnlockExpired) {
                      clearUnlockState();
                    }
                    setUnlockError('');
                    setShowUnlockDialog(true);
                  }}
                >
                  {deletionUnlocked ? <LockOpen className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Unlock User Deletion
                </Button>
              </div>
            </CardContent>
          </Card>

          {deletionUnlocked && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-900">
              <LockOpen className="h-4 w-4" />
              <AlertTitle>User deletion unlocked</AlertTitle>
              <AlertDescription>
                User deletion unlocked — expires in {minutesRemaining} minute{minutesRemaining === 1 ? '' : 's'}.
              </AlertDescription>
            </Alert>
          )}

          {/* Users List */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {loading && <p className="text-sm text-muted-foreground">Loading users...</p>}
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-4 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#1B2E55] flex items-center justify-center text-white font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#1B2E55]">{u.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </p>
                        <p className="text-xs text-muted-foreground">Joined: {new Date(u.joinedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          u.role === 'admin'
                            ? 'bg-red-500/10 text-red-600 border-red-500'
                            : u.role === 'organizer'
                            ? 'bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]'
                            : 'bg-blue-500/10 text-blue-600 border-blue-500'
                        }
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {u.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          u.status === 'active'
                            ? 'bg-green-500/10 text-green-600 border-green-500'
                            : 'bg-gray-500/10 text-gray-600 border-gray-500'
                        }
                      >
                        {u.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(u)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!deletionUnlocked}
                        className={
                          deletionUnlocked
                            ? showDeleteConfirm === u.id
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'text-red-600'
                            : 'text-gray-400'
                        }
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        {deletionUnlocked ? <UserX className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {showDeleteConfirm === u.id ? 'Confirm?' : ''}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#1B2E55]">Edit User</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingUser(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-role">Role</Label>
                      <select
                        id="edit-role"
                        className="w-full p-2 border-2 rounded-md"
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <select
                        id="edit-status"
                        className="w-full p-2 border-2 rounded-md"
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveUser}
                        className="flex-1 bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingUser(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Dialog
            open={showUnlockDialog}
            onOpenChange={(open) => {
              setShowUnlockDialog(open);
              if (!open) {
                setMasterPassword('');
                setUnlockError('');
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unlock User Deletion</DialogTitle>
                <DialogDescription>
                  Enter the admin master password to enable user deletion for 30 minutes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="master-password">Master Password</Label>
                <Input
                  id="master-password"
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleUnlockDeletion();
                    }
                  }}
                />
                {unlockError && (
                  <p className="text-sm text-red-600">{unlockError}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUnlockDialog(false);
                    setMasterPassword('');
                    setUnlockError('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                  disabled={isUnlocking}
                  onClick={() => {
                    void handleUnlockDeletion();
                  }}
                >
                  {isUnlocking ? 'Confirming...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

