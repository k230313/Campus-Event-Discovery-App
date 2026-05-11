import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { RSVPProvider } from './context/RSVPContext';
import { Navigation } from './components/Navigation';
import { Chatbot } from './components/Chatbot';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookmarkProvider>
          <RSVPProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/create-event" element={<CreateEvent />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Chatbot />
            </div>
          </RSVPProvider>
        </BookmarkProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}