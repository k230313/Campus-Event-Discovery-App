// ============================================
// File:    Navigation.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Navigation frontend component.
// ============================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogIn, LogOut, UserPlus, Home, PlusCircle, Bookmark, Users, User, Shield, BarChart, Tag, FileText, Mail, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { Badge } from './ui/badge';

/**
 * Renders the primary navigation bar and role-specific menu actions.
 * @returns {JSX.Element} Header navigation tailored to the current authentication state.
 */
export function Navigation() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Checks whether a navigation path matches the current route.
   * @param {string} path - Route path to compare against the active location.
   * @returns {boolean} True when the supplied path is active.
   */
  const isActive = (path: string) => location.pathname === path;

  /**
   * Returns dark-header button styles that keep navigation labels readable in both active and inactive states.
   * @param {string} path - Route path associated with the navigation button.
   * @returns {string} Tailwind class list for the navigation button.
   */
  const getNavButtonClasses = (path: string) => (
    isActive(path)
      ? 'text-white bg-white/20 hover:text-white hover:bg-white/25'
      : 'text-white bg-transparent hover:text-white hover:bg-white/20'
  );

  /**
   * Logs out the current user and returns them to the login screen.
   * @returns {void} Does not return a value.
   */
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="border-b bg-[#1B2E55]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center" aria-label="CEDA home">
              <Logo className="h-10 w-auto brightness-0 invert" aria-hidden="true" focusable="false" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {/* Not Logged In Navigation */}
              {!user && (
                <>
                  <Link to="/">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/about')}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      About Us
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/contact')}
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
                      variant="ghost"
                      className={getNavButtonClasses('/')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/my-bookmarks">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/my-bookmarks')}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      My Bookmarks
                    </Button>
                  </Link>
                  <Link to="/my-events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/my-events')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Events
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/profile')}
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
                      variant="ghost"
                      className={getNavButtonClasses('/')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/my-bookmarks">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/my-bookmarks')}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      My Bookmarks
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/dashboard')}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/create-event">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/create-event')}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link to="/manage-events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/manage-events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/profile')}
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
                      variant="ghost"
                      className={getNavButtonClasses('/')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                  <Link to="/admin-dashboard">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/admin-dashboard')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                  <Link to="/manage-users">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/manage-users')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link to="/admin-manage-events">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/admin-manage-events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/categories')}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Categories
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button
                      variant="ghost"
                      className={getNavButtonClasses('/reports')}
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
                  onClick={handleLogout}
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
