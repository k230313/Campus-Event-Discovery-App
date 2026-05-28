// ============================================
// File:    AboutUs.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the About Us page for the frontend application.
// ============================================

import { Calendar, Users, Target, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { PageMeta } from '../components/PageMeta';

/**
 * Renders the AboutUs component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9]">
      <PageMeta
        title="About CEDA | Campus Event Discovery App"
        description="Learn about the Campus Event Discovery App, its mission to centralize Kent Institute events, and the value it brings to students and organizers."
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About CEDA</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Campus Event Discovery App - Your gateway to campus life at Kent Institute
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1B2E55] mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed">
              CEDA was created to solve the challenge of scattered event information across Kent Institute.
              Our mission is to centralize all campus events, making it easy for students to discover,
              participate, and engage with the vibrant campus community.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <Card className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-8">
                  <Target className="h-12 w-12 text-[#EF9B28] mb-4" />
                  <h3 className="text-xl font-bold text-[#1B2E55] mb-3">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the central hub for all Kent Institute events, fostering a connected
                    and engaged campus community where every student can easily find opportunities
                    that match their interests.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-8">
                  <Award className="h-12 w-12 text-[#EF9B28] mb-4" />
                  <h3 className="text-xl font-bold text-[#1B2E55] mb-3">Our Values</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe in accessibility, inclusivity, and community. CEDA is designed to be
                    user-friendly, ensuring every student can easily participate in campus life,
                    regardless of their background or experience.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-[#EF9B28] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#1B2E55] mb-2">8+</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-[#EF9B28] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#1B2E55] mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Students Engaged</div>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 text-[#EF9B28] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#1B2E55] mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Event Organizers</div>
              </div>
            </div>

            {/* What We Offer */}
            <h2 className="text-3xl font-bold text-[#1B2E55] mb-6 text-center">What We Offer</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                <strong className="text-[#1B2E55]">Centralized Event Information:</strong> All campus events
                in one easy-to-navigate platform, eliminating the need to check multiple sources.
              </p>
              <p className="leading-relaxed">
                <strong className="text-[#1B2E55]">Easy Event Discovery:</strong> Search and filter events
                by category, date, and location to find exactly what interests you.
              </p>
              <p className="leading-relaxed">
                <strong className="text-[#1B2E55]">RSVP & Volunteering:</strong> Register for events as an
                attendee or volunteer, with options for food preferences and seating.
              </p>
              <p className="leading-relaxed">
                <strong className="text-[#1B2E55]">AI-Powered Assistance:</strong> Our intelligent chatbot
                helps you find events through natural language conversations.
              </p>
              <p className="leading-relaxed">
                <strong className="text-[#1B2E55]">Event Management Tools:</strong> Organizers can create,
                edit, and manage events with comprehensive tracking features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
