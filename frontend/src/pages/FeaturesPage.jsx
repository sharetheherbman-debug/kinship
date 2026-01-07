import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Calendar, MessageCircle, Wallet, FileText,
  CloudSun, Gift, Sparkles, Map, Shield, Bell, Camera,
  Plane, ArrowRight, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    icon: Users,
    title: "Family Groups",
    description: "Create your family group and invite members from anywhere in the world with a simple invite code. Perfect for extended families spread across different countries.",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: Calendar,
    title: "Trip Planning & Countdown",
    description: "Build detailed itineraries together with real-time collaboration. Watch the excitement build with live countdown timers showing exactly when you'll be together again.",
    color: "from-teal-500 to-cyan-600"
  },
  {
    icon: MessageCircle,
    title: "Real-time Family Chat",
    description: "Stay connected with instant messaging. Share updates, photos, and coordinate plans without switching between apps. Everyone stays in the loop.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Map,
    title: "Live Location Tracking",
    description: "Consent-based location sharing lets you see where family members are during travel. Perfect for airport pickups and ensuring everyone's safe arrival.",
    color: "from-emerald-500 to-teal-600"
  },
  {
    icon: Wallet,
    title: "Budget & Expense Splitting",
    description: "Track trip expenses in any currency. Split costs fairly between family members and see who owes who at a glance. No more awkward money conversations.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Securely store passport details, visa info, and travel insurance. Get automatic alerts before documents expire so you're never caught off guard.",
    color: "from-rose-500 to-pink-600"
  },
  {
    icon: CloudSun,
    title: "Weather Forecasts",
    description: "Real-time weather updates for your destination. Know exactly what to pack and plan outdoor activities with confidence.",
    color: "from-sky-500 to-blue-600"
  },
  {
    icon: Gift,
    title: "Milestone Tracker",
    description: "Never miss a birthday or anniversary during your trip. Get reminders for important family dates and make celebrations extra special.",
    color: "from-fuchsia-500 to-purple-600"
  },
  {
    icon: Sparkles,
    title: "AI Travel Assistant",
    description: "Get personalized recommendations, auto-generated itineraries, and smart packing lists. Your AI travel companion makes planning effortless.",
    color: "from-teal-500 to-emerald-600"
  }
];

const additionalFeatures = [
  "Collaborative packing lists",
  "Activity suggestions for all ages",
  "Multi-timezone support",
  "Offline access to itineraries",
  "Photo sharing & galleries",
  "Push notifications",
  "Emergency contact hub",
  "Travel checklist templates"
];

export default function FeaturesPage() {
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
              Powerful Features
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything your family needs to travel together
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From planning to memories, Kinship Journeys has every tool to make 
              your family adventures seamless and unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              And so much more...
            </h2>
            <p className="text-lg text-slate-600">
              Discover all the little details that make a big difference
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 bg-slate-50 rounded-xl p-4"
              >
                <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <span className="text-slate-700">{feature}</span>
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
              Ready to bring your family together?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Start planning your next adventure today. It's free to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-white text-teal-600 hover:bg-slate-100 text-lg px-10 py-6 rounded-full font-bold shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-full">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
