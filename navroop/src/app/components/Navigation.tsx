import { Link, useLocation } from 'react-router';
import { Calendar, LayoutDashboard, LogIn, LogOut, UserPlus, Home, PlusCircle, Bookmark, Users, User, Shield, BarChart, Tag, FileText, Mail, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { Badge } from './ui/badge';

export function Navigation() {
  const { user, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-[#1B2E55]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto brightness-0 invert" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {/* Not Logged In Navigation */}
              {!user && (
                <>
                  <Link to="/">
                    <Button
                      variant={isActive('/') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant={isActive('/events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button
                      variant={isActive('/about') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      About Us
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button
                      variant={isActive('/contact') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                  </Link>
                </>
              )}

              {/* Student Navigation */}
              {user && user.role === 'student' && (
                <>
                  <Link to="/">
                    <Button
                      variant={isActive('/') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant={isActive('/events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/my-bookmarks">
                    <Button
                      variant={isActive('/my-bookmarks') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      My Bookmarks
                    </Button>
                  </Link>
                  <Link to="/my-events">
                    <Button
                      variant={isActive('/my-events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Events
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant={isActive('/profile') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}

              {/* Organizer Navigation */}
              {user && user.role === 'organizer' && (
                <>
                  <Link to="/">
                    <Button
                      variant={isActive('/') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant={isActive('/events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/create-event">
                    <Button
                      variant={isActive('/create-event') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link to="/manage-events">
                    <Button
                      variant={isActive('/manage-events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant={isActive('/profile') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}

              {/* Admin Navigation */}
              {user && user.role === 'admin' && (
                <>
                  <Link to="/">
                    <Button
                      variant={isActive('/') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant={isActive('/events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/admin-dashboard">
                    <Button
                      variant={isActive('/admin-dashboard') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                  <Link to="/manage-users">
                    <Button
                      variant={isActive('/manage-users') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link to="/admin-manage-events">
                    <Button
                      variant={isActive('/admin-manage-events') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button
                      variant={isActive('/categories') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Categories
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button
                      variant={isActive('/reports') ? 'secondary' : 'ghost'}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      <BarChart className="h-4 w-4 mr-2" />
                      Reports
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-white text-sm font-medium">
                    {user.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-400 border-red-400'
                        : user.role === 'organizer'
                        ? 'bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]'
                        : 'bg-white/20 text-white border-white/30'
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : user.role === 'organizer' ? (
                      <>
                        <Users className="h-3 w-3 mr-1" />
                        Organizer
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3 w-3 mr-1" />
                        Student
                      </>
                    )}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#EF9B28] hover:bg-[#EF9B28]/90 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
