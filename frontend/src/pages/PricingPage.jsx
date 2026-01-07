import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Users, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PRICING = {
  monthly: {
    price: 4.99,
    period: 'month',
    savings: null
  },
  yearly: {
    price: 49.99,
    period: 'year',
    savings: 'Save $10'
  }
};

const features = [
  'Up to 10 family members',
  'Unlimited trips',
  'Real-time family chat',
  'AI-powered trip planning',
  'Live location tracking',
  'Document vault with alerts',
  'Expense splitting',
  'Weather forecasts',
  'Milestone reminders',
  'Priority support'
];

const faqs = [
  {
    q: "Can I try before I subscribe?",
    a: "Absolutely! You get a 14-day free trial with full access to all features. No credit card required."
  },
  {
    q: "What if I have more than 10 family members?",
    a: "We've got you covered! You can add extra members for just $1.99/month per 5 additional members."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. No questions asked, no hidden fees."
  },
  {
    q: "Is my data secure?",
    a: "Your privacy is our priority. All data is encrypted, and location sharing is fully consent-based."
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('yearly');

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-teal-500/30">
              Simple Pricing
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              One plan for the whole family
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              No complicated tiers. Just everything you need to plan amazing family adventures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-24 px-6 -mt-12">
        <div className="max-w-lg mx-auto">
          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-slate-100 p-1.5 rounded-full inline-flex">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly' 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly' 
                    ? 'bg-white text-slate-900 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly
                <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">
                  Save $10
                </span>
              </button>
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] blur-xl opacity-30"></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
                <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">Family Plan</h2>
                <div className="flex items-baseline justify-center gap-1 text-white">
                  <span className="text-5xl font-heading font-bold">
                    ${PRICING[billingPeriod].price}
                  </span>
                  <span className="text-slate-400">/{PRICING[billingPeriod].period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-teal-300 text-sm mt-2">That's just $4.17/month</p>
                )}
              </div>

              {/* Features */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Extra members note */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Need more members?</p>
                      <p className="text-sm text-slate-600">Add $1.99/month per 5 extra members</p>
                    </div>
                  </div>
                </div>

                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-lg py-6 rounded-full font-bold shadow-lg shadow-teal-500/30" data-testid="pricing-cta-btn">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                
                <p className="text-center text-sm text-slate-500 mt-4">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and never shared" },
              { icon: Zap, title: "Cancel Anytime", desc: "No long-term contracts or commitments" },
              { icon: Users, title: "Family Friendly", desc: "Designed for families of all sizes" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 rounded-2xl p-6"
              >
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
              Start your free trial today
            </h2>
            <p className="text-xl text-white/90 mb-10">
              14 days free. No credit card required. Full access to all features.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-teal-600 hover:bg-slate-100 text-lg px-10 py-6 rounded-full font-bold shadow-xl">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
