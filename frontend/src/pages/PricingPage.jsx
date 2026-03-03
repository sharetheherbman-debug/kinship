import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, ArrowRight, Sparkles, Users, Shield, Zap, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PRICING = {
  monthly: { price: 4.99, period: 'month' },
  yearly: { price: 49.99, period: 'year', monthly: 4.17 }
};

const features = [
  'Up to 10 family members',
  'Unlimited trips',
  'Real-time family chat',
  'AI-powered trip planning',
  'Live location tracking',
  'Cell phone tracking via SMS',
  'Document vault with alerts',
  'Expense splitting',
  'Weather forecasts',
  'Milestone reminders',
  'Priority support'
];

const faqs = [
  { q: "How does the free trial work?", a: "You get 7 days of full access to all features. No credit card required to start. After 7 days, you'll need to subscribe to continue." },
  { q: "What if I have more than 10 family members?", a: "No problem! Add extra members for just $1.99/month per 5 additional members." },
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime with no questions asked. Your data stays safe for 30 days in case you change your mind." },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted, and location sharing is fully consent-based. We never sell your data." }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('yearly');
  const [openFaq, setOpenFaq] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setCheckingOut(true);
    try {
      const res = await axios.post(`${API_URL}/api/payments/checkout`, {
        plan: billingPeriod,
        origin_url: window.location.origin,
        currency: user?.currency || 'USD'
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      const detail = error.response?.data?.detail || 'Payment system unavailable. Please try again later.';
      toast.error(detail);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-teal-500/30">
              Simple Pricing
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
              One plan, whole family
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              No complicated tiers. Everything you need for $4.99/month.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-full inline-flex border border-white/10">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >Monthly</button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">Save $10</span>
              </button>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] blur-xl opacity-30"></div>
            
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-8 text-center border-b border-white/10">
                <div className="inline-flex items-center gap-2 bg-teal-500/30 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  7-Day Free Trial
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-4">Family Plan</h2>
                <div className="flex items-baseline justify-center gap-1 text-white mb-2">
                  <span className="text-5xl font-heading font-bold">${PRICING[billingPeriod].price}</span>
                  <span className="text-slate-400">/{PRICING[billingPeriod].period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-teal-300 text-sm">That's just ${PRICING.yearly.monthly}/month</p>
                )}
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="font-semibold text-white">Need more members?</p>
                      <p className="text-sm text-slate-400">$1.99/month per 5 extra</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg py-6 rounded-2xl font-bold shadow-lg shadow-teal-500/30"
                  data-testid="pricing-cta-btn"
                >
                  {checkingOut ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="ml-2 w-5 h-5 order-last" />
                  )}
                  {user ? 'Subscribe Now' : 'Start 7-Day Free Trial'}
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">No credit card required for trial</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and never shared" },
              { icon: Zap, title: "Cancel Anytime", desc: "No contracts, no commitments" },
              { icon: Users, title: "Family Friendly", desc: "Designed for families of all sizes" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Questions?</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-white">{faq.q}</h3>
                    <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === index && (
                    <p className="text-slate-400 mt-4">{faq.a}</p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const faqs = [
  { q: "How does the free trial work?", a: "You get 7 days of full access to all features. No credit card required to start. After 7 days, you'll need to subscribe to continue." },
  { q: "What if I have more than 10 family members?", a: "No problem! Add extra members for just $1.99/month per 5 additional members." },
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime with no questions asked. Your data stays safe for 30 days in case you change your mind." },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted, and location sharing is fully consent-based. We never sell your data." }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('yearly');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-teal-500/30">
              Simple Pricing
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
              One plan, whole family
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              No complicated tiers. Everything you need for $4.99/month.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-full inline-flex border border-white/10">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >Monthly</button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">Save $10</span>
              </button>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] blur-xl opacity-30"></div>
            
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-8 text-center border-b border-white/10">
                <div className="inline-flex items-center gap-2 bg-teal-500/30 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  7-Day Free Trial
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-4">Family Plan</h2>
                <div className="flex items-baseline justify-center gap-1 text-white mb-2">
                  <span className="text-5xl font-heading font-bold">${PRICING[billingPeriod].price}</span>
                  <span className="text-slate-400">/{PRICING[billingPeriod].period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-teal-300 text-sm">That's just ${PRICING.yearly.monthly}/month</p>
                )}
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-400" />
                    <div>
                      <p className="font-semibold text-white">Need more members?</p>
                      <p className="text-sm text-slate-400">$1.99/month per 5 extra</p>
                    </div>
                  </div>
                </div>

                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg py-6 rounded-2xl font-bold shadow-lg shadow-teal-500/30" data-testid="pricing-cta-btn">
                    Start 7-Day Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-slate-500 mt-4">No credit card required</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 px-6 border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and never shared" },
              { icon: Zap, title: "Cancel Anytime", desc: "No contracts, no commitments" },
              { icon: Users, title: "Family Friendly", desc: "Designed for families of all sizes" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Questions?</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-white">{faq.q}</h3>
                    <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === index && (
                    <p className="text-slate-400 mt-4">{faq.a}</p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
