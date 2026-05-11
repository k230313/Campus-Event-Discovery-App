import { Link, useLocation } from 'react-router';
import { Calendar, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#182E55] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
              <div className="bg-[#EEA928] text-[#182E55] px-3 py-1.5 rounded font-bold text-lg">
                KENT
              </div>
              <span className="hidden sm:block font-medium text-sm">Campus Event Discovery</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex gap-6">
              <Link
                to="/events"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                  isActive('/events')
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Events
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    isActive('/dashboard')
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-white/90">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-md text-sm transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Log In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#EEA928] text-[#182E55] hover:bg-[#EEA928]/90 rounded-md text-sm font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex gap-3">
          <Link
            to="/events"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs transition ${
              isActive('/events')
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Events
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs transition ${
                isActive('/dashboard')
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
