// ============================================
// File:    ContactUs.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Contact Us page for the frontend application.
// ============================================

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useEffect, useRef, useState } from 'react';
import { csrfFetch } from '../services/api';
import { PageMeta } from '../components/PageMeta';
import { useTurnstileScript } from '../hooks/useTurnstileScript';

/**
 * Renders the ContactUs component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function ContactUs() {
  const TURNSTILE_SITE_KEY = '0x4AAAAAADN5Ecy-ORG9dtgF';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitState, setSubmitState] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const { isReady: isTurnstileReady, loadError: turnstileLoadError } = useTurnstileScript();

  useEffect(() => {
    /**
     * Renders the Cloudflare Turnstile widget once the external script is available.
     * @returns {void} Does not return a value.
     */
    const maybeRenderWidget = () => {
      const turnstile = (window as any).turnstile;

      if (!turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) {
        return;
      }

      turnstileWidgetIdRef.current = turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        /**
         * Stores the token returned by a successful captcha challenge.
         * @param {string} token - Verified Turnstile token issued by Cloudflare.
         * @returns {void} Does not return a value.
         */
        callback: (token: string) => {
          setTurnstileToken(token);
          setSubmitState({ type: 'idle', message: '' });
        },
        'expired-callback': () => {
          setTurnstileToken('');
        },
        'error-callback': () => {
          setTurnstileToken('');
          setSubmitState({
            type: 'error',
            message: 'Captcha verification failed. Please try again.',
          });
        },
      });
    };

    if (isTurnstileReady) {
      maybeRenderWidget();
    }

    return () => {
      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetIdRef.current !== null) {
        turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileReady]);

  /**
   * Submits the contact form to the backend contact endpoint.
   * @param {React.FormEvent} e - Form submit event from the contact form.
   * @returns {Promise<void>} Resolves after the submission attempt finishes.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setSubmitState({
        type: 'error',
        message: 'Please complete the captcha challenge.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ type: 'idle', message: '' });

    try {
      const response = await csrfFetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = Array.isArray(payload?.errors)
          ? payload.errors.join(' ')
          : payload?.error || 'We could not send your message right now. Please try again later.';

        setSubmitState({
          type: 'error',
          message: errorMessage,
        });

        const turnstile = (window as any).turnstile;
        if (turnstile && turnstileWidgetIdRef.current !== null) {
          turnstile.reset(turnstileWidgetIdRef.current);
        }
        setTurnstileToken('');
        return;
      }

      setSubmitState({
        type: 'success',
        message: 'Thank you for your message. We will get back to you soon.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetIdRef.current !== null) {
        turnstile.reset(turnstileWidgetIdRef.current);
      }
      setTurnstileToken('');
    } catch (_error) {
      setSubmitState({
        type: 'error',
        message: 'We could not send your message right now. Please try again later.',
      });
      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetIdRef.current !== null) {
        turnstile.reset(turnstileWidgetIdRef.current);
      }
      setTurnstileToken('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F3F9]">
      <PageMeta
        title="Contact Us | Campus Event Discovery App"
        description="Contact the Campus Event Discovery App team for event support, general questions, or platform assistance at Kent Institute."
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1B2E55] via-[#2a4575] to-[#1B2E55] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1B2E55]">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Verification</Label>
                    <div ref={turnstileContainerRef} className="min-h-16" />
                    {turnstileLoadError ? (
                      <p className="text-sm text-red-600 mt-2">{turnstileLoadError}</p>
                    ) : !isTurnstileReady ? (
                      <p className="text-sm text-muted-foreground mt-2">Loading captcha...</p>
                    ) : null}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#EF9B28] hover:bg-[#EF9B28]/90"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </Button>
                  {submitState.type !== 'idle' ? (
                    <p className={submitState.type === 'success' ? 'text-sm text-green-700' : 'text-sm text-red-600'}>
                      {submitState.message}
                    </p>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#EF9B28]/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-[#EF9B28]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#1B2E55] mb-2">Visit Us</h3>
                      <p className="text-muted-foreground">
                        Kent Institute<br />
                        123 University Drive<br />
                        Sydney, NSW 2000<br />
                        Australia
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#EF9B28]/10 rounded-lg">
                      <Phone className="h-6 w-6 text-[#EF9B28]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#1B2E55] mb-2">Call Us</h3>
                      <p className="text-muted-foreground">
                        +61 2 1234 5678<br />
                        Monday - Friday: 9:00 AM - 5:00 PM<br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-[#EF9B28]/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#EF9B28]/10 rounded-lg">
                      <Mail className="h-6 w-6 text-[#EF9B28]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#1B2E55] mb-2">Email Us</h3>
                      <p className="text-muted-foreground">
                        General Inquiries: info@ceda.kent.edu.au<br />
                        Event Support: events@ceda.kent.edu.au<br />
                        Technical Support: support@ceda.kent.edu.au
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
