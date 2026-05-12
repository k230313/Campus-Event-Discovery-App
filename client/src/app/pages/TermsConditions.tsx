import { FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

export function TermsConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-[#EF9B28]" />
            </div>
            <h1 className="text-4xl font-bold text-[#1B2E55] mb-2">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last updated: May 12, 2026</p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-8 prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-6">
                By accessing and using the Campus Event Discovery App (CEDA), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms and Conditions, please do not use CEDA.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">2. User Accounts</h2>
              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">2.1 Account Registration</h3>
              <p className="text-muted-foreground mb-4">
                To access certain features of CEDA, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">2.2 Account Eligibility</h3>
              <p className="text-muted-foreground mb-6">
                CEDA is available only to Kent Institute students, staff, and authorized personnel. By creating an account, you confirm that you are affiliated with Kent Institute.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">3. User Conduct</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Use CEDA for any unlawful purpose or in violation of these Terms</li>
                <li>Post false, misleading, or fraudulent event information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the operation of CEDA</li>
                <li>Attempt to gain unauthorized access to any part of CEDA</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Share your account credentials with others</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">4. Event Management</h2>
              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">4.1 Event Creation (Organizers)</h3>
              <p className="text-muted-foreground mb-4">
                Event organizers agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Provide accurate and complete event information</li>
                <li>Update event details promptly if changes occur</li>
                <li>Cancel events responsibly with adequate notice</li>
                <li>Comply with Kent Institute policies and guidelines</li>
                <li>Not use CEDA to promote commercial or external events without authorization</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1B2E55] mb-3">4.2 Event Registration (Students)</h3>
              <p className="text-muted-foreground mb-4">
                Students who register for events agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Attend events they have registered for or cancel in advance</li>
                <li>Follow event-specific rules and guidelines</li>
                <li>Behave respectfully toward organizers and other attendees</li>
                <li>Provide accurate information when registering</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground mb-6">
                All content on CEDA, including text, graphics, logos, and software, is the property of Kent Institute or its licensors and is protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or reproduce any content without prior written permission.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">6. User-Generated Content</h2>
              <p className="text-muted-foreground mb-4">
                By posting content on CEDA (event descriptions, comments, etc.), you grant Kent Institute a non-exclusive, royalty-free license to use, reproduce, and display that content on CEDA. You represent that:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>You own or have the right to post the content</li>
                <li>The content does not violate any third-party rights</li>
                <li>The content complies with these Terms and applicable laws</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground mb-6">
                CEDA is provided "as is" and "as available" without warranties of any kind, either express or implied. Kent Institute does not warrant that CEDA will be uninterrupted, error-free, or secure. You use CEDA at your own risk.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-6">
                To the fullest extent permitted by law, Kent Institute shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of CEDA, including but not limited to loss of data, revenue, or profits.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">9. Event Liability</h2>
              <p className="text-muted-foreground mb-6">
                Kent Institute is not responsible for the content, accuracy, or conduct of events listed on CEDA. Event organizers are solely responsible for their events. Kent Institute does not guarantee the quality, safety, or legality of any event.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">10. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, without prior notice. Upon termination, your right to use CEDA will immediately cease.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">11. Privacy</h2>
              <p className="text-muted-foreground mb-6">
                Your use of CEDA is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We may modify these Terms at any time. We will notify users of significant changes by posting a notice on CEDA or sending an email. Continued use of CEDA after changes constitutes acceptance of the modified Terms.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from these Terms or your use of CEDA shall be subject to the exclusive jurisdiction of the courts of Sydney, Australia.
              </p>

              <h2 className="text-2xl font-bold text-[#1B2E55] mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-[#F0F3F9] p-4 rounded-lg mb-6">
                <p className="text-muted-foreground mb-2"><strong>Email:</strong> legal@ceda.kent.edu.au</p>
                <p className="text-muted-foreground mb-2"><strong>Phone:</strong> +61 2 1234 5678</p>
                <p className="text-muted-foreground"><strong>Address:</strong> Kent Institute, 123 University Drive, Sydney, NSW 2000, Australia</p>
              </div>

              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-muted-foreground text-center">
                  By using CEDA, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
