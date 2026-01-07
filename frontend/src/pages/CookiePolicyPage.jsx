import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cookie, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const cookieTypes = [
  {
    name: 'Essential Cookies',
    required: true,
    description: 'Required for the website to function. These cannot be disabled.',
    examples: ['Session authentication', 'Security tokens', 'Load balancing'],
  },
  {
    name: 'Functional Cookies',
    required: false,
    description: 'Remember your preferences and settings for a better experience.',
    examples: ['Language preferences', 'Theme settings', 'Recently viewed trips'],
  },
  {
    name: 'Analytics Cookies',
    required: false,
    description: 'Help us understand how you use our service so we can improve it.',
    examples: ['Page views', 'Feature usage', 'Error reporting'],
  },
];

export default function CookiePolicyPage() {
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
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Cookie className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-white">Cookie Policy</h1>
                <p className="text-slate-400">Last updated: January 2025</p>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <p className="text-slate-300 leading-relaxed">
                  This Cookie Policy explains how Kinship Journeys uses cookies and similar technologies to recognize you when you visit our platform.
                </p>
              </div>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
                  <p>
                    Cookies are small text files that are stored on your device when you visit a website. They help the website remember information about your visit, making your next visit easier and more useful.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
                  <div className="space-y-6 mt-6">
                    {cookieTypes.map((type, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-heading font-bold text-white text-lg">{type.name}</h3>
                          {type.required && (
                            <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-full border border-teal-500/30">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mb-4">{type.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-300">Examples:</p>
                          {type.examples.map((example, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                              <CheckCircle className="w-4 h-4 text-teal-500" />
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
                  <p className="mb-4">
                    Some features on our platform may set cookies from third-party services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Stripe</strong> - For secure payment processing</li>
                    <li><strong className="text-white">Analytics</strong> - To understand usage patterns (anonymized)</li>
                  </ul>
                  <p className="mt-4">
                    These third parties have their own privacy policies governing their use of cookies.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">How to Control Cookies</h2>
                  <p className="mb-4">
                    You have control over cookies in several ways:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                    <li><strong className="text-white">In-App Settings:</strong> Manage non-essential cookies in your account settings</li>
                    <li><strong className="text-white">Cookie Banner:</strong> Choose your preferences when you first visit</li>
                  </ul>
                  <p className="mt-4">
                    Note: Blocking essential cookies may prevent certain features from working properly.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">Cookie Retention</h2>
                  <p>
                    Different cookies have different lifespans:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                    <li><strong className="text-white">Session cookies:</strong> Deleted when you close your browser</li>
                    <li><strong className="text-white">Persistent cookies:</strong> Remain until they expire or you delete them</li>
                    <li><strong className="text-white">Our cookies:</strong> Most expire within 30 days to 1 year</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
                  <p>
                    We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.
                  </p>
                </section>

                <section>
                  <h2 className="font-heading text-2xl font-bold text-white mb-4">Contact Us</h2>
                  <p>
                    If you have questions about our use of cookies, contact us at:
                  </p>
                  <p className="mt-4">
                    <strong className="text-white">Email:</strong> privacy@kinshipjourneys.com<br />
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
