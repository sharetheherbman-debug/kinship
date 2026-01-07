import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MapPin, Calendar, MessageCircle, Wallet, FileText,
  CloudSun, Gift, Sparkles, Map, Shield, Bell, Camera,
  Plane, ArrowRight, CheckCircle, Clock, Globe, Heart,
  Smartphone, Zap, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const heroFeatures = [
  {
    icon: Calendar,
    title: "AI Trip Planning",
    description: "Our AI creates perfect family-friendly itineraries based on your preferences, ages of family members, and budget.",
    gradient: "from-violet-500 to-purple-600",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600"
  },
  {
    icon: Map,
    title: "Live Location Tracking", 
    description: "Always know where your family is with consent-based real-time location sharing. Perfect for peace of mind during travel.",
    gradient: "from-emerald-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600"
  },
  {
    icon: Wallet,
    title: "Smart Expense Splitting",
    description: "Track every expense and automatically calculate who owes who. Multiple currency support for international families.",
    gradient: "from-amber-500 to-orange-600",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600"
  },
];

const allFeatures = [
  { icon: Users, title: "Family Groups", desc: "Create your family, invite members from anywhere with a simple code" },
  { icon: MessageCircle, title: "Real-time Chat", desc: "Stay connected with instant messaging and photo sharing" },
  { icon: Clock, title: "Trip Countdown", desc: "Live countdown timers build excitement for upcoming adventures" },
  { icon: FileText, title: "Document Vault", desc: "Securely store passports, visas, and insurance with expiry alerts" },
  { icon: CloudSun, title: "Weather Forecasts", desc: "Know what to pack with real-time destination weather" },
  { icon: Gift, title: "Milestone Tracker", desc: "Never miss birthdays or anniversaries while traveling" },
  { icon: Sparkles, title: "AI Assistant", desc: "Get personalized recommendations and travel tips" },
  { icon: Lock, title: "Privacy Controls", desc: "Full control over what you share and with whom" },
  { icon: Globe, title: "Multi-currency", desc: "Budgets and expenses in any currency, auto-converted" },
  { icon: Smartphone, title: "Works Anywhere", desc: "Full access on phone, tablet, or desktop" },
  { icon: Bell, title: "Smart Alerts", desc: "Notifications for important updates and reminders" },
  { icon: Camera, title: "Photo Sharing", desc: "Share memories instantly with your whole family" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block bg-teal-500/20 text-teal-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-teal-500/30">
              Powerful Features
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Built for families who
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300"> love to travel</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Every feature designed to make planning easier, traveling smoother, and memories more meaningful.
            </p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-8 py-6 rounded-2xl shadow-lg shadow-teal-500/30">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Hero Features - Large Cards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {heroFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <Link to="/auth">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative rounded-3xl overflow-hidden group">
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${feature.gradient} opacity-20`}></div>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              And that's just the beginning
            </h2>
            <p className="text-lg text-slate-400">
              Discover all the features that make Kinship Journeys special
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to try it yourself?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            7-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-6 rounded-2xl shadow-lg shadow-teal-500/30">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-2xl">
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
