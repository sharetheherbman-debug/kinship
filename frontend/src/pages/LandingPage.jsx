import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, Star, Users, MapPin, Calendar, 
  MessageCircle, Shield, Sparkles, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HERO_IMAGES = [
  'https://images.pexels.com/photos/8623945/pexels-photo-8623945.jpeg', // Family at beach
  'https://images.pexels.com/photos/1342404/pexels-photo-1342404.jpeg', // Family swimming
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Bold & Exciting */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0">
          <img 
            src={HERO_IMAGES[0]}
            alt="Happy family running at beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
                <div className="flex -space-x-2">
                  {['👨‍👩‍👧‍👦', '👨‍👩‍👦', '👩‍👧‍👦'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-sm border-2 border-white/20">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">Trusted by 10,000+ families worldwide</span>
              </div>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8">
                Create 
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">Unforgettable</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8C50 2 150 2 198 8" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="2" y1="8" x2="198" y2="8">
                        <stop stopColor="#2DD4BF"/>
                        <stop offset="1" stopColor="#22D3EE"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                Family Memories
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                The ultimate travel planning app that brings your whole family together. 
                Plan trips, share moments, and stay connected—no matter the distance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/auth">
                  <Button className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-8 py-6 rounded-full shadow-2xl shadow-teal-500/30 transition-all hover:scale-105" data-testid="hero-cta-btn">
                    Start Planning Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-sm">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-white font-medium">4.9/5</span>
                </div>
                <div className="h-6 w-px bg-white/20"></div>
                <span className="text-slate-400">Based on 2,500+ reviews</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Feature Preview Strip */}
      <section className="relative -mt-20 z-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 md:p-12 grid md:grid-cols-4 gap-8"
          >
            {[
              { icon: Users, label: 'Family Groups', value: 'Unlimited members' },
              { icon: MapPin, label: 'Trip Planning', value: 'AI-powered' },
              { icon: MessageCircle, label: 'Real-time Chat', value: 'Stay connected' },
              { icon: Shield, label: 'Location Sharing', value: 'Privacy first' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 mb-1">{item.label}</h3>
                <p className="text-sm text-slate-500">{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block bg-teal-100 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                Why Families Love Us
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Everything you need for the perfect family trip
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                From the first spark of an idea to sharing photos after you're home, 
                Kinship Journeys keeps everyone on the same page. Plan together, 
                travel together, remember together.
              </p>
              
              <div className="space-y-4">
                {[
                  'Collaborative trip planning with AI suggestions',
                  'Real-time location sharing with full privacy control',
                  'Shared budgets and expense splitting made easy',
                  'Document vault with passport expiry alerts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/features" className="inline-block mt-8">
                <Button variant="outline" className="rounded-full px-6 group">
                  Explore All Features
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={HERO_IMAGES[1]}
                  alt="Family enjoying water activities"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              {/* Floating Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 max-w-[240px]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-slate-900">Beach Holiday</p>
                    <p className="text-xs text-slate-500">In 12 days</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {['M', 'D', 'S', 'J'].map((initial, i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white">
                      {initial}
                    </div>
                  ))}
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-600 font-medium border-2 border-white">
                    +3
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Highlight */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center gap-1 mb-8">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-8">
              "We used to coordinate our family trips through endless WhatsApp messages. 
              Now with Kinship, everyone sees the plan, the countdown, and we even track 
              each other during travel. It's been a game-changer for our family reunions!"
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

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-[2.5rem] p-12 md:p-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <Heart className="w-16 h-16 text-white/80 mx-auto mb-8" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
                Your family's next adventure awaits
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of families creating unforgettable memories together. 
                Start planning your dream trip today—it's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button className="bg-white text-teal-600 hover:bg-slate-100 text-lg px-10 py-6 rounded-full font-bold shadow-xl" data-testid="cta-get-started-btn">
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
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
