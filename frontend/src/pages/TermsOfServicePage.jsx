import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white mb-8 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
                <p className="text-slate-400">Last updated: January 2025</p>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <p className="text-slate-300 leading-relaxed">
                  Welcome to Amarktai Network. By using our service, you agree to these terms. Please read them carefully.
                </p>
              </div>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using Amarktai Network, you agree to be bound by these Terms of Service and our Privacy Policy. If you don't agree, please don't use our service.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                  <p className="mb-4">
                    Amarktai Network is a family travel planning platform that provides:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Trip planning and itinerary creation tools</li>
                    <li>Family group collaboration features</li>
                    <li>Real-time chat and location sharing</li>
                    <li>Document storage vault</li>
                    <li>AI-powered travel recommendations</li>
                    <li>Expense tracking and splitting</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">3. Account Registration</h2>
                  <p className="mb-4">To use Amarktai Network, you must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be at least 18 years old</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">4. Free Trial and Subscription</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>New users receive a 7-day free trial with full access</li>
                    <li>After the trial, a paid subscription is required to continue</li>
                    <li>Subscriptions are billed monthly or annually</li>
                    <li>You can cancel your subscription at any time</li>
                    <li>No refunds for partial billing periods</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                  <p className="mb-4">You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the service for any illegal purpose</li>
                    <li>Share your account with non-family members</li>
                    <li>Attempt to access other users' accounts or data</li>
                    <li>Upload malicious content or code</li>
                    <li>Interfere with the proper functioning of the service</li>
                    <li>Use the service to harass or harm others</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">6. User Content</h2>
                  <p className="mb-4">
                    You retain ownership of content you create (trips, photos, documents). By using our service, you grant us a license to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Store and display your content to you and your family</li>
                    <li>Create backups for data protection</li>
                    <li>Use anonymized data to improve our AI recommendations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">7. Third-Party Services</h2>
                  <p>
                    Our service integrates with third-party providers (Stripe for payments, OpenAI for AI features). Your use of these features is subject to their respective terms of service.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">8. Disclaimers</h2>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>The service is provided "as is" without warranties</li>
                    <li>We don't guarantee uninterrupted or error-free service</li>
                    <li>Travel recommendations are suggestions only—verify all bookings independently</li>
                    <li>We're not responsible for third-party service outages</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                  <p>
                    To the maximum extent permitted by law, Amarktai Network shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">10. Termination</h2>
                  <p>
                    We may terminate or suspend your account if you violate these terms. You may close your account at any time through settings. Upon termination, your data will be deleted within 30 days.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
                  <p>
                    We may update these terms from time to time. We'll notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">12. Contact</h2>
                  <p>
                    Questions about these terms? Contact us at:
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">Email:</strong> legal@amarktainetwork.com<br />
                    <strong className="text-white">Address:</strong> Cape Town, South Africa
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
