// ============================================
// File:    App.tsx
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Defines the top-level router, layout shell, and protected routes for the frontend.
// ============================================

import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

const ChatBot = lazy(() => import('./components/ChatBot').then((module) => ({ default: module.ChatBot })));
const Events = lazy(() => import('./pages/Events').then((module) => ({ default: module.Events })));
const EventDetail = lazy(() => import('./pages/EventDetail').then((module) => ({ default: module.EventDetail })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then((module) => ({ default: module.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const CreateEvent = lazy(() => import('./pages/CreateEvent').then((module) => ({ default: module.CreateEvent })));
const EditEvent = lazy(() => import('./pages/EditEvent').then((module) => ({ default: module.EditEvent })));
const AboutUs = lazy(() => import('./pages/AboutUs').then((module) => ({ default: module.AboutUs })));
const ContactUs = lazy(() => import('./pages/ContactUs').then((module) => ({ default: module.ContactUs })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const MyBookmarks = lazy(() => import('./pages/MyBookmarks').then((module) => ({ default: module.MyBookmarks })));
const MyEvents = lazy(() => import('./pages/MyEvents').then((module) => ({ default: module.MyEvents })));
const ManageEvents = lazy(() => import('./pages/ManageEvents').then((module) => ({ default: module.ManageEvents })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const ManageUsers = lazy(() => import('./pages/ManageUsers').then((module) => ({ default: module.ManageUsers })));
const AdminManageEvents = lazy(() => import('./pages/AdminManageEvents').then((module) => ({ default: module.AdminManageEvents })));
const Categories = lazy(() => import('./pages/Categories').then((module) => ({ default: module.Categories })));
const Reports = lazy(() => import('./pages/Reports').then((module) => ({ default: module.Reports })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((module) => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((module) => ({ default: module.ResetPassword })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then((module) => ({ default: module.VerifyEmail })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((module) => ({ default: module.PrivacyPolicy })));
const TermsConditions = lazy(() => import('./pages/TermsConditions').then((module) => ({ default: module.TermsConditions })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then((module) => ({ default: module.Unauthorized })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const RegistrationConfirmation = lazy(() => import('./pages/RegistrationConfirmation').then((module) => ({ default: module.RegistrationConfirmation })));
const SiteMap = lazy(() => import('./pages/SiteMap').then((module) => ({ default: module.SiteMap })));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-16 text-center text-slate-600">
      Loading...
    </div>
  );
}

function DeferredChatBot() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const deferLoad = () => setShouldRender(true);

    if (typeof window === 'undefined') {
      return undefined;
    }

    if ('requestIdleCallback' in window) {
      const idleId = (window as Window & {
        requestIdleCallback: (callback: IdleRequestCallback) => number;
        cancelIdleCallback: (id: number) => void;
      }).requestIdleCallback(() => {
        deferLoad();
      });

      return () => {
        (window as Window & {
          cancelIdleCallback: (id: number) => void;
        }).cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(deferLoad, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ChatBot />
    </Suspense>
  );
}

/**
 * Renders the application's global providers, shared layout, and route tree.
 * @returns {JSX.Element} Browser router, shared shell, and page routes for the app.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:eventId" element={<EventDetail />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/sitemap" element={<SiteMap />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/registration-confirmation" element={<RegistrationConfirmation />} />

                {/* Student Routes */}
                <Route path="/my-bookmarks" element={<ProtectedRoute allowedRoles={['student', 'organizer']}><MyBookmarks /></ProtectedRoute>} />
                <Route path="/my-events" element={<ProtectedRoute allowedRoles={['student']}><MyEvents /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Organizer Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'student']}><Dashboard /></ProtectedRoute>} />
                <Route path="/create-event" element={<ProtectedRoute allowedRoles={['organizer']}><CreateEvent /></ProtectedRoute>} />
                <Route path="/edit-event/:eventId" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EditEvent /></ProtectedRoute>} />
                <Route path="/manage-events" element={<ProtectedRoute allowedRoles={['organizer']}><ManageEvents /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin-manage-events" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageEvents /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute allowedRoles={['admin']}><Categories /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

                {/* 404 - Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <DeferredChatBot />
          <Toaster richColors position="top-right" />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
