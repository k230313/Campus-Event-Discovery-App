// ============================================
// File:    Navigation.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Navigation frontend component.
// ============================================

import type { ElementType, ReactNode } from 'react';
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

  /**
   * Renders a navigation link with shared button styling while keeping valid interactive HTML.
   * @param {object} props - Link configuration for a single navigation action.
   * @returns {JSX.Element} Styled route link for the top navigation.
   */
  const NavActionLink = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon: ElementType;
    children: ReactNode;
  }) => (
    <Button
      asChild
      variant="ghost"
      className={getNavButtonClasses(to)}
    >
      <Link to={to}>
        <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
        {children}
      </Link>
    </Button>
  );

  return (
    <nav className="border-b bg-[#1B2E55]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center" aria-label="Campus Events home">
              <Logo className="h-10 w-auto brightness-0 invert" aria-hidden="true" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {/* Not Logged In Navigation */}
              {!user && (
                <>
                  <NavActionLink to="/" icon={Home}>Home</NavActionLink>
                  <NavActionLink to="/events" icon={Calendar}>Browse Events</NavActionLink>
                  <NavActionLink to="/about" icon={Info}>About Us</NavActionLink>
                  <NavActionLink to="/contact" icon={Mail}>Contact Us</NavActionLink>
                </>
              )}

              {/* Student Navigation */}
              {user && user.role === 'student' && (
                <>
                  <NavActionLink to="/" icon={Home}>Home</NavActionLink>
                  <NavActionLink to="/events" icon={Calendar}>Browse Events</NavActionLink>
                  <NavActionLink to="/my-bookmarks" icon={Bookmark}>My Bookmarks</NavActionLink>
                  <NavActionLink to="/my-events" icon={FileText}>My Events</NavActionLink>
                  <NavActionLink to="/profile" icon={User}>Profile</NavActionLink>
                </>
              )}

              {/* Organizer Navigation */}
              {user && user.role === 'organizer' && (
                <>
                  <NavActionLink to="/" icon={Home}>Home</NavActionLink>
                  <NavActionLink to="/events" icon={Calendar}>Browse Events</NavActionLink>
                  <NavActionLink to="/my-bookmarks" icon={Bookmark}>My Bookmarks</NavActionLink>
                  <NavActionLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavActionLink>
                  <NavActionLink to="/create-event" icon={PlusCircle}>Create Event</NavActionLink>
                  <NavActionLink to="/manage-events" icon={Calendar}>Manage Events</NavActionLink>
                  <NavActionLink to="/profile" icon={User}>Profile</NavActionLink>
                </>
              )}

              {/* Admin Navigation */}
              {user && user.role === 'admin' && (
                <>
                  <NavActionLink to="/" icon={Home}>Home</NavActionLink>
                  <NavActionLink to="/events" icon={Calendar}>Browse Events</NavActionLink>
                  <NavActionLink to="/admin-dashboard" icon={Shield}>Admin Dashboard</NavActionLink>
                  <NavActionLink to="/manage-users" icon={Users}>Manage Users</NavActionLink>
                  <NavActionLink to="/admin-manage-events" icon={Calendar}>Manage Events</NavActionLink>
                  <NavActionLink to="/categories" icon={Tag}>Categories</NavActionLink>
                  <NavActionLink to="/reports" icon={BarChart}>Reports</NavActionLink>
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
                <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/20">
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="gap-1.5 bg-[#EF9B28] hover:bg-[#D97706] text-[#1B2E55] font-semibold">
                  <Link to="/register">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
