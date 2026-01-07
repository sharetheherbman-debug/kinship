import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Calendar, MessageCircle, Wallet, FileText,
  CloudSun, Gift, Sparkles, Map, Shield, Bell, Camera,
  Plane, ArrowRight, CheckCircle, Clock, Globe, Heart,
  Smartphone, Zap, Lock, Navigation, CreditCard, Share2,
  Image, AlertTriangle, Wifi, Download, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const IMAGES = {
  planning: 'https://images.pexels.com/photos/7368182/pexels-photo-7368182.jpeg',
  adventure: 'https://images.pexels.com/photos/1469880/pexels-photo-1469880.jpeg',
  family: 'https://images.pexels.com/photos/5961944/pexels-photo-5961944.jpeg',
};

const heroFeatures = [
  {
    icon: Calendar,
    title: "AI-Powered Trip Planning",
    description: "Let our intelligent assistant create personalized itineraries based on your family's ages, interests, and budget. Collaborate in real-time with everyone having input.",
    gradient: "from-violet-500 to-purple-600",
    image: IMAGES.planning,
    benefits: ['Smart suggestions based on family ages', 'Real-time collaborative editing', 'Budget-aware recommendations', 'Automatic conflict detection'],
  },
  {
    icon: Map,
    title: "Live Family Location", 
    description: "Always know where everyone is with consent-based real-time location sharing. Perfect for crowded airports, theme parks, or exploring new cities.",
    gradient: "from-teal-500 to-cyan-600",
    image: IMAGES.adventure,
    benefits: ['Consent-based sharing', 'Battery-efficient tracking', 'Geofence alerts', 'History timeline view'],
  },
  {
    icon: Wallet,
    title: "Smart Expense Splitting",
    description: "Track every expense and automatically calculate who owes who. Multiple currency support makes international family trips a breeze.",
    gradient: "from-amber-500 to-orange-600",
    image: IMAGES.beach,
    benefits: ['Automatic currency conversion', 'Fair split calculations', 'Receipt photo storage', 'Export to spreadsheets'],
  },
];

const allFeatures = [
  { icon: Users, title: "Family Groups", desc: "Create your family, invite members from anywhere with a simple code. Manage multiple families if needed.", gradient: "from-blue-500 to-indigo-600" },
  { icon: MessageCircle, title: "Real-time Chat", desc: "Stay connected with instant messaging, photo sharing, and voice notes.", gradient: "from-pink-500 to-rose-600" },
  { icon: Clock, title: "Trip Countdown", desc: "Live countdown timers build excitement for upcoming adventures.", gradient: "from-amber-500 to-orange-600" },
  { icon: FileText, title: "Document Vault", desc: "Securely store passports, visas, and insurance with automatic expiry alerts.", gradient: "from-emerald-500 to-teal-600" },
  { icon: CloudSun, title: "Weather Forecasts", desc: "Know what to pack with real-time destination weather forecasts.", gradient: "from-sky-500 to-blue-600" },
  { icon: Gift, title: "Milestone Tracker", desc: "Never miss birthdays, anniversaries, or special dates while traveling.", gradient: "from-purple-500 to-violet-600" },
  { icon: Sparkles, title: "AI Assistant", desc: "Get personalized recommendations, travel tips, and instant answers.", gradient: "from-teal-500 to-cyan-600" },
  { icon: Lock, title: "Privacy Controls", desc: "Full control over what you share and with whom.", gradient: "from-slate-500 to-gray-600" },
  { icon: Globe, title: "Multi-currency", desc: "Budgets and expenses in any currency, auto-converted in real-time.", gradient: "from-green-500 to-emerald-600" },
  { icon: Smartphone, title: "Works Anywhere", desc: "Full access on phone, tablet, or desktop with offline support.", gradient: "from-indigo-500 to-blue-600" },
  { icon: Bell, title: "Smart Alerts", desc: "Get notified about important updates, reminders, and changes.", gradient: "from-rose-500 to-pink-600" },
  { icon: Camera, title: "Photo Sharing", desc: "Create shared albums and memories that everyone can contribute to.", gradient: "from-orange-500 to-amber-600" },
];

const comparisonFeatures = [
  { feature: 'AI Trip Planning', us: true, others: false },
  { feature: 'Real-time Location Sharing', us: true, others: false },
  { feature: 'Expense Splitting', us: true, others: true },
  { feature: 'Document Vault', us: true, others: false },
  { feature: 'Family Chat', us: true, others: true },
  { feature: 'Weather Forecasts', us: true, others: false },
  { feature: 'Multi-currency Support', us: true, others: false },
  { feature: 'Offline Access', us: true, others: false },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-5 py-2.5 rounded-full mb-8 border border-teal-500/30">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Built for families who
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300"> love to travel</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Every feature designed to make planning easier, traveling smoother, and memories more meaningful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-7 rounded-2xl shadow-xl shadow-teal-500/25 font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-10 py-7 rounded-2xl">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Features - Large Cards with Images */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-32">
            {heroFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center`}
              >
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-8 shadow-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  {/* Benefits List */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-slate-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/auth">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 group">
                      Try This Feature
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative">
                    <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-3xl`} />
                    <div className="relative rounded-3xl overflow-hidden group shadow-2xl border border-white/10">
                      <img 
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Full Feature List
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              And that's just the beginning
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Discover all the features that make Kinship Journeys the ultimate family travel companion.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500 group hover:border-white/20"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Why families choose us
            </h2>
            <p className="text-lg text-slate-400">
              See how Kinship Journeys compares to generic travel apps
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden"
          >
            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
              <div className="p-6 font-heading font-bold text-white">Feature</div>
              <div className="p-6 text-center font-heading font-bold text-teal-400">Kinship Journeys</div>
              <div className="p-6 text-center font-heading font-bold text-slate-400">Other Apps</div>
            </div>
            {comparisonFeatures.map((item, index) => (
              <div key={index} className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                <div className="p-5 text-slate-300 border-b border-white/5">{item.feature}</div>
                <div className="p-5 text-center border-b border-white/5">
                  <CheckCircle className={`w-6 h-6 mx-auto ${item.us ? 'text-teal-400' : 'text-slate-600'}`} />
                </div>
                <div className="p-5 text-center border-b border-white/5">
                  {item.others ? (
                    <CheckCircle className="w-6 h-6 mx-auto text-slate-500" />
                  ) : (
                    <div className="w-6 h-6 mx-auto rounded-full border-2 border-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[200px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to try it yourself?
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            7-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-12 py-7 rounded-2xl shadow-xl shadow-teal-500/25 font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-12 py-7 rounded-2xl">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
