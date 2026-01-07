import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Star, Users, MapPin, Calendar, 
  MessageCircle, Shield, Sparkles, Heart, ChevronRight,
  Wallet, FileText, CloudSun, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Amazing family images
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1767081697732-c312fb3f1ce7',
  feature1: 'https://images.unsplash.com/photo-1766974889185-944702443548',
  feature2: 'https://images.pexels.com/photos/3933989/pexels-photo-3933989.jpeg',
  testimonial: 'https://images.unsplash.com/photo-1759559585493-8f3a10cec180',
};

const miniFeatures = [
  { icon: Users, title: 'Family Groups', desc: 'Everyone together' },
  { icon: Calendar, title: 'Trip Planning', desc: 'AI-powered itineraries' },
  { icon: MessageCircle, title: 'Live Chat', desc: 'Stay connected' },
  { icon: Map, title: 'Location Sharing', desc: 'Know where everyone is' },
];

const mainFeatures = [
  {
    icon: Calendar,
    title: 'Smart Trip Planning',
    description: 'AI-powered itinerary builder that creates perfect family-friendly plans. Collaborate in real-time with live countdown to your adventure.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Wallet,
    title: 'Split Expenses Fairly',
    description: 'Track every expense and automatically calculate who owes who. Support for multiple currencies makes international trips a breeze.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Map,
    title: 'Live Location Tracking',
    description: 'Consent-based location sharing so you always know your family is safe. Perfect for airport pickups and coordinating meetups.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Securely store passport details and travel documents. Get automatic alerts before anything expires.',
    gradient: 'from-rose-500 to-pink-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <Navbar />

      {/* HERO - Immersive Full Screen */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <img 
            src={IMAGES.hero}
            alt="Happy family smiling together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950"></div>
          
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badge - Realistic numbers */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2.5 mb-8">
                <div className="flex -space-x-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-slate-950/50 flex items-center justify-center">
                      <span className="text-[10px]">👨‍👩‍👧</span>
                    </div>
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">Join 500+ families planning together</span>
              </div>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-8">
                Where Families
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-300">
                    Come Together
                  </span>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-teal-500/50 to-cyan-500/50 blur-sm origin-left"
                  />
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                Plan unforgettable adventures, share special moments, and stay connected—no matter how far apart you are.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link to="/auth">
                  <Button className="group relative bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-8 py-7 rounded-2xl shadow-2xl shadow-teal-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-teal-500/50 overflow-hidden" data-testid="hero-cta-btn">
                    <span className="relative z-10 flex items-center">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-white font-semibold">4.9</span>
                </div>
                <div className="h-5 w-px bg-white/20"></div>
                <span className="text-slate-400">Loved by families in 45+ countries</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-sm">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Strip */}
      <section className="relative z-20 -mt-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-2"
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              {miniFeatures.map((item, i) => (
                <div key={i} className={`p-6 text-center ${i < 3 ? 'border-r border-white/10' : ''} ${i < 2 ? 'border-b md:border-b-0 border-white/10' : ''}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-32 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Powerful Features
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Everything your family needs
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From planning to memories, we've got every aspect of family travel covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="font-heading font-bold text-xl text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 group">
                See All Features
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Image + Text Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden">
                <img 
                  src={IMAGES.feature2}
                  alt="Family enjoying nature together"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating stat cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-slate-900 text-lg">2,000+</p>
                    <p className="text-sm text-slate-500">Trips planned</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
                Why Families Choose Us
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Because family time is precious
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                We built Kinship Journeys for families like ours—spread across cities, 
                countries, even continents. Every feature is designed to bring you closer 
                together and make your time count.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Plan together in real-time, no matter where you are',
                  'Keep everyone safe with consent-based location sharing',
                  'Never forget important documents or dates',
                  'Split costs fairly—no awkward conversations',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-2xl px-8 py-6 shadow-lg shadow-teal-500/30">
                  Try It Free for 7 Days
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center gap-1 mb-8">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-7 h-7 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-10">
              "Finally, a way to keep our whole family—from grandparents in Cape Town to 
              cousins in London—on the same page. The countdown feature has everyone 
              excited for our next reunion!"
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                SM
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Sarah Mitchell</p>
                <p className="text-slate-400">Cape Town, South Africa</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to bring your family together?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start your free 7-day trial. No credit card required.
          </p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all hover:scale-105">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
