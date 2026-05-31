// ============================================
// File:    Navigation.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Navigation frontend component.
// ============================================

import type { ElementType, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, LayoutDashboard, LogIn, LogOut, UserPlus, Home, PlusCircle, Bookmark, Users, User, Shield, BarChart, Tag, FileText, Mail, Info, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

/**
 * Renders the primary navigation bar and role-specific menu actions.
 * @returns {JSX.Element} Header navigation tailored to the current authentication state.
 */
export function Navigation() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const sharedPublicLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/events', icon: Calendar, label: 'Browse Events' },
  ];

  const roleLinks = !user
    ? [
        ...sharedPublicLinks,
        { to: '/about', icon: Info, label: 'About Us' },
        { to: '/contact', icon: Mail, label: 'Contact Us' },
      ]
    : user.role === 'student'
    ? [
        ...sharedPublicLinks,
        { to: '/my-bookmarks', icon: Bookmark, label: 'My Bookmarks' },
        { to: '/my-events', icon: FileText, label: 'My Events' },
        { to: '/profile', icon: User, label: 'Profile' },
      ]
    : user.role === 'organizer'
    ? [
        ...sharedPublicLinks,
        { to: '/my-bookmarks', icon: Bookmark, label: 'My Bookmarks' },
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/create-event', icon: PlusCircle, label: 'Create Event' },
        { to: '/manage-events', icon: Calendar, label: 'Manage Events' },
        { to: '/profile', icon: User, label: 'Profile' },
      ]
    : [
        ...sharedPublicLinks,
        { to: '/admin-dashboard', icon: Shield, label: 'Admin Dashboard' },
        { to: '/manage-users', icon: Users, label: 'Manage Users' },
        { to: '/admin-manage-events', icon: Calendar, label: 'Manage Events' },
        { to: '/categories', icon: Tag, label: 'Categories' },
        { to: '/reports', icon: BarChart, label: 'Reports' },
      ];

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

  /**
   * Renders a mobile navigation row inside the slide-out sheet.
   * @param {object} props - Link configuration for the current menu item.
   * @returns {JSX.Element} Full-width mobile navigation link.
   */
  const MobileNavLink = ({
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
      className={`w-full justify-start text-base ${getNavButtonClasses(to)}`}
    >
      <Link to={to} onClick={() => setMobileMenuOpen(false)}>
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
              {roleLinks.map((link) => (
                <NavActionLink key={link.to} to={link.to} icon={link.icon}>
                  {link.label}
                </NavActionLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-white hover:bg-white/20"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="border-r border-slate-200 bg-[#1B2E55] text-white"
                >
                  <SheetHeader className="border-b border-white/10">
                    <SheetTitle className="text-white">Navigation</SheetTitle>
                    <SheetDescription className="text-white/70">
                      Quick access to the main areas of CEDA.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
                    {user ? (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="font-semibold text-white">{user.name}</p>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              user.role === 'admin'
                                ? 'bg-red-500/20 text-red-200 border-red-300'
                                : user.role === 'organizer'
                                ? 'bg-[#EF9B28]/20 text-[#F7C77B] border-[#EF9B28]'
                                : 'bg-white/20 text-white border-white/30'
                            }`}
                          >
                            {user.role === 'admin' ? 'Admin' : user.role === 'organizer' ? 'Organizer' : 'Student'}
                          </Badge>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2">
                      {roleLinks.map((link) => (
                        <MobileNavLink key={link.to} to={link.to} icon={link.icon}>
                          {link.label}
                        </MobileNavLink>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
                      {user ? (
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-base text-white hover:text-white hover:bg-white/20"
                        >
                          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                          Logout
                        </Button>
                      ) : (
                        <>
                          <Button asChild variant="ghost" className="w-full justify-start text-base text-white hover:text-white hover:bg-white/20">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                              <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                              Login
                            </Link>
                          </Button>
                          <Button asChild className="w-full justify-start gap-1.5 bg-[#EF9B28] hover:bg-[#D97706] text-[#1B2E55] font-semibold">
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                              <UserPlus className="h-4 w-4" aria-hidden="true" />
                              Sign Up
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 mr-2">
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
                  className="hidden md:inline-flex text-white hover:text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
