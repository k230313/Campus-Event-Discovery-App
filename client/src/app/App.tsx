// ============================================
// File:    App.tsx
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Defines the top-level router, layout shell, and protected routes for the frontend.
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { ChatBot } from './components/ChatBot';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';
import { EditEvent } from './pages/EditEvent';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { Profile } from './pages/Profile';
import { MyBookmarks } from './pages/MyBookmarks';
import { MyEvents } from './pages/MyEvents';
import { ManageEvents } from './pages/ManageEvents';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageUsers } from './pages/ManageUsers';
import { AdminManageEvents } from './pages/AdminManageEvents';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { Settings } from './pages/Settings';
import { RegistrationConfirmation } from './pages/RegistrationConfirmation';
import { SiteMap } from './pages/SiteMap';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

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
          </main>
          <Footer />
          <ChatBot />
          <Toaster richColors position="top-right" />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
