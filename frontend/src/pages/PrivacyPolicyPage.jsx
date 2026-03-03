import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
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
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
                <p className="text-slate-400">Last updated: January 2025</p>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <p className="text-slate-300 leading-relaxed">
                  At Amarktai Network, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our family travel planning platform.
                </p>
              </div>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                  <p className="mb-4">We collect information you provide directly, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Account information (name, email, password)</li>
                    <li>Family group details and member information</li>
                    <li>Trip plans, itineraries, and travel preferences</li>
                    <li>Documents stored in your vault (passport numbers stored securely with only last 4 digits visible)</li>
                    <li>Location data (only when you enable location sharing)</li>
                    <li>Chat messages within your family group</li>
                    <li>Payment information (processed securely through Stripe)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                  <p className="mb-4">We use your information to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and improve our family travel planning services</li>
                    <li>Enable real-time collaboration with your family members</li>
                    <li>Send important notifications about your trips and account</li>
                    <li>Process payments and manage your subscription</li>
                    <li>Provide AI-powered travel recommendations</li>
                    <li>Ensure the security and integrity of our platform</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">3. Location Data</h2>
                  <p className="mb-4">
                    Location sharing is entirely optional and consent-based. When enabled:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your location is only shared with family members you approve</li>
                    <li>You can disable sharing at any time</li>
                    <li>Location history is retained for 7 days by default</li>
                    <li>You can delete your location history at any time</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">4. Data Security</h2>
                  <p className="mb-4">
                    We implement industry-standard security measures:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                    <li>Passwords are hashed using bcrypt</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls and authentication for all services</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
                  <p className="mb-4">
                    We never sell your personal data. We only share data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With family members you explicitly invite</li>
                    <li>With service providers who help us operate (Stripe for payments)</li>
                    <li>When required by law or to protect our legal rights</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                  <p className="mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and associated data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">7. Data Retention</h2>
                  <p>
                    We retain your data while your account is active. Upon account deletion, we remove your personal data within 30 days, except where retention is required by law.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                  <p>
                    Amarktai Network is designed for families, but accounts must be created by adults (18+). Children's information is managed by adult family members and protected by the same security measures.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                  <p>
                    For privacy-related questions or to exercise your rights, contact us at:
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">Email:</strong> privacy@amarktainetwork.com<br />
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
