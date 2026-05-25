// ============================================
// File:    Home.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Home page for the frontend application.
// ============================================

import { Link } from 'react-router-dom';
import { Calendar, Search, Bookmark, Users, ArrowRight, Sparkles, TrendingUp, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

/**
 * Renders the Home component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55] text-white py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1612277107663-a65c0f67be64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Campus background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B2E55]/50 via-[#2a4575]/40 to-[#1B2E55]/50"></div>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#EF9B28]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#EF9B28]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]/30 px-4 py-1">
              <Sparkles className="mr-2 h-4 w-4" />
              Welcome to CEDA
            </Badge>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text">
              Discover Campus Events
            </h1>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your centralized platform for all Kent Institute campus events. Never miss out on workshops, networking opportunities, and social gatherings.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                size="lg"
                className="bg-[#B45309] hover:bg-[#92400E] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/events">
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1B2E55] dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#1B2E55] shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#EF9B28] mb-2">8+</div>
                <div className="text-sm text-white/70">Active Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#EF9B28] mb-2">500+</div>
                <div className="text-sm text-white/70">Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#EF9B28] mb-2">50+</div>
                <div className="text-sm text-white/70">Organizers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#1B2E55]/10 text-[#1B2E55] border-[#1B2E55]/20">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-[#1B2E55]">
              Why Use CEDA?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay connected with campus life
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-[#EF9B28]/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="pt-8 pb-6">
                <div className="text-center">
                  <div className="inline-block p-5 bg-gradient-to-br from-[#1B2E55] to-[#2a4575] rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-[#1B2E55]">Centralized Events</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All campus events in one place. No more scattered information across different platforms.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#EF9B28]/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="pt-8 pb-6">
                <div className="text-center">
                  <div className="inline-block p-5 bg-gradient-to-br from-[#EF9B28] to-[#d68a20] rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-[#1B2E55]">Easy Discovery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Search and filter events by category, date, and location with our powerful search tools.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#EF9B28]/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="pt-8 pb-6">
                <div className="text-center">
                  <div className="inline-block p-5 bg-gradient-to-br from-[#1B2E55] to-[#2a4575] rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Bookmark className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-[#1B2E55]">Save & Track</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bookmark events you're interested in and track your RSVPs in your personal dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#EF9B28]/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="pt-8 pb-6">
                <div className="text-center">
                  <div className="inline-block p-5 bg-gradient-to-br from-[#EF9B28] to-[#d68a20] rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-[#1B2E55]">Get Involved</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    RSVP, volunteer, and connect with fellow students to build your network.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55]"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#EF9B28] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#EF9B28] rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-6 bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]/30">
              <Bell className="mr-2 h-4 w-4" />
              Join the Community
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join hundreds of students discovering and participating in campus events. Your next opportunity awaits!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                asChild
                size="lg"
                className="bg-[#B45309] hover:bg-[#92400E] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/events">
                  <TrendingUp className="mr-2 h-5 w-5" aria-hidden="true" />
                  Explore Events Now
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1B2E55] dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#1B2E55] shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
