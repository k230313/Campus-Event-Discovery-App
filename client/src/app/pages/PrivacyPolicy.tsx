// ============================================
// File:    PrivacyPolicy.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Privacy Policy page for the frontend application.
// ============================================

import { Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

/**
 * Renders the PrivacyPolicy component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-[#EF9B28]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: May 12, 2026</p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-8 prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-6">
                Welcome to the Campus Event Discovery App (CEDA). Kent Institute ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Name and email address</li>
                <li>Account credentials (username and encrypted password)</li>
                <li>User role (Student, Organizer, or Admin)</li>
                <li>Profile information</li>
                <li>Event RSVPs and preferences (food choices, seating)</li>
                <li>Bookmarked events</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">2.2 Usage Information</h3>
              <p className="text-muted-foreground mb-6">
                We automatically collect certain information about your device and how you interact with CEDA, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>IP address</li>
                <li>Pages visited and features used</li>
                <li>Event views and interactions</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your event registrations and manage your bookmarks</li>
                <li>Send you event notifications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li><strong>Event Organizers:</strong> Your name and email may be shared with event organizers when you RSVP to their events</li>
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who help us operate CEDA</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to legal process</li>
                <li><strong>Safety and Security:</strong> We may share information to protect the rights, property, or safety of Kent Institute, our users, or others</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing where applicable</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-6">
                We use cookies and similar tracking technologies to collect usage information and improve our services. You can control cookies through your browser settings, but disabling them may affect your ability to use certain features of CEDA.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                CEDA is intended for use by Kent Institute students and staff who are 18 years or older. We do not knowingly collect information from individuals under 18.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-[#F0F3F9] p-4 rounded-lg mb-6">
                <p className="text-muted-foreground mb-2"><strong>Email:</strong> privacy@ceda.kent.edu.au</p>
                <p className="text-muted-foreground mb-2"><strong>Phone:</strong> +61 2 1234 5678</p>
                <p className="text-muted-foreground"><strong>Address:</strong> Kent Institute, 123 University Drive, Sydney, NSW 2000, Australia</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
