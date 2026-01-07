import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Star, Users, MapPin, Calendar, 
  MessageCircle, Shield, Sparkles, Heart, ChevronRight,
  Wallet, FileText, Map, Plane, Camera, Globe,
  Clock, CheckCircle2, Play, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRef } from 'react';

// Premium family travel images - wholesome adventure themes
const IMAGES = {
  hero: 'https://images.pexels.com/photos/1157399/pexels-photo-1157399.jpeg',
  adventure: 'https://images.pexels.com/photos/1469880/pexels-photo-1469880.jpeg',
  sunset: 'https://images.pexels.com/photos/35473890/pexels-photo-35473890.jpeg',
  family: 'https://images.pexels.com/photos/5961944/pexels-photo-5961944.jpeg',
  planning: 'https://images.pexels.com/photos/7368182/pexels-photo-7368182.jpeg',
  camping: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg',
  exploration: 'https://images.pexels.com/photos/7978854/pexels-photo-7978854.jpeg',
};

const quickFeatures = [
  { icon: Users, title: 'Family Groups', desc: 'Everyone connected', color: 'from-violet-500 to-purple-600' },
  { icon: Calendar, title: 'Trip Planning', desc: 'AI-powered itineraries', color: 'from-teal-500 to-cyan-600' },
  { icon: MessageCircle, title: 'Live Chat', desc: 'Real-time updates', color: 'from-amber-500 to-orange-600' },
  { icon: Map, title: 'Location Sharing', desc: 'Peace of mind', color: 'from-rose-500 to-pink-600' },
];

const mainFeatures = [
  {
    icon: Calendar,
    title: 'AI-Powered Trip Planning',
    description: 'Our intelligent assistant creates personalized itineraries based on your family\'s ages, interests, and budget. Real-time collaboration means everyone has input.',
    gradient: 'from-violet-500 to-purple-600',
    image: IMAGES.planning,
  },
  {
    icon: Map,
    title: 'Live Family Tracking',
    description: 'Know where everyone is with consent-based GPS sharing. Perfect for crowded airports, theme parks, or exploring new cities together.',
    gradient: 'from-teal-500 to-cyan-600',
    image: IMAGES.adventure,
  },
  {
    icon: Wallet,
    title: 'Smart Expense Splitting',
    description: 'No more awkward "who paid for what" conversations. Track expenses, split costs fairly, and settle up with a tap.',
    gradient: 'from-amber-500 to-orange-600',
    image: IMAGES.camping,
  },
];

const testimonials = [
  {
    quote: "Finally, a way to keep our whole family—from grandparents in Cape Town to cousins in London—on the same page. The countdown feature has everyone excited!",
    name: "Sarah Mitchell",
    role: "Mother of 3",
    location: "Cape Town, South Africa",
    avatar: "SM"
  },
  {
    quote: "Planning our annual family reunion used to be a nightmare. Now it's actually fun! The AI suggestions are spot-on.",
    name: "James Chen",
    role: "Family organizer",
    location: "Singapore",
    avatar: "JC"
  },
  {
    quote: "The location tracking gave me peace of mind when my teenagers wanted to explore on their own. Game changer!",
    name: "Elena Rodriguez",
    role: "Travel enthusiast",
    location: "Madrid, Spain",
    avatar: "ER"
  }
];

const stats = [
  { number: '500+', label: 'Happy Families' },
  { number: '2,000+', label: 'Trips Planned' },
  { number: '45+', label: 'Countries' },
  { number: '4.9', label: 'App Rating' },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <Navbar />

      {/* HERO SECTION - Immersive Full Screen */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center">
        {/* Parallax Background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img 
            src={IMAGES.hero}
            alt="Happy family enjoying vacation together"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
        </motion.div>
        
        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Trust Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-10"
              >
                <div className="flex -space-x-2">
                  {['👨‍👩‍👧', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👦'].map((emoji, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-slate-950/50 flex items-center justify-center shadow-lg">
                      <span className="text-xs">{emoji}</span>
                    </div>
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">Join 500+ families planning together</span>
              </motion.div>
              
              {/* Main Headline */}
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-8">
                Where Families
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-300 animate-gradient">
                    Come Together
                  </span>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-teal-500/40 to-cyan-500/40 blur-lg origin-left"
                  />
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                Plan unforgettable adventures, share special moments, and stay connected—no matter how far apart you are.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/auth">
                  <Button className="group relative bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-teal-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-teal-500/50 overflow-hidden" data-testid="hero-cta-btn">
                    <span className="relative z-10 flex items-center font-semibold">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-10 py-7 rounded-2xl transition-all duration-300">
                    <Play className="mr-2 w-5 h-5" />
                    See How It Works
                  </Button>
                </Link>
              </div>

              {/* Social Proof Row */}
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-white font-bold">4.9</span>
                </div>
                <div className="h-6 w-px bg-white/20 hidden sm:block" />
                <span className="text-slate-400">Loved by families in 45+ countries</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-sm font-medium">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-teal-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Quick Features Strip */}
      <section className="relative z-20 -mt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              {quickFeatures.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 md:p-8 text-center group cursor-pointer transition-all duration-300 hover:bg-white/5 rounded-2xl ${i < 3 ? 'border-r border-white/10' : ''}`}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features - Alternating Layout */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Powerful Features
            </span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Everything your family needs
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From planning to memories, we've got every aspect of family travel covered.
            </p>
          </motion.div>

          <div className="space-y-32">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-8 shadow-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-slate-400 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  <Link to="/features">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 group">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative">
                    <div className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-3xl`} />
                    <div className="relative rounded-3xl overflow-hidden group shadow-2xl">
                      <img 
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link to="/features">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-7 group text-lg">
                See All Features
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Testimonials
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Families love us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group"
              >
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <blockquote className="text-white text-lg leading-relaxed mb-8">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Showcase */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Create memories that last forever
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From beach getaways to mountain adventures, we help families make the most of every moment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative rounded-3xl overflow-hidden h-[400px] group"
            >
              <img src={IMAGES.sunset} alt="Family at sunset" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-teal-400 font-semibold text-sm">Golden Moments</span>
                <h3 className="text-white text-2xl font-heading font-bold">Sunset Adventures</h3>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden h-[400px] group"
            >
              <img src={IMAGES.exploration} alt="Family exploration" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-amber-400 font-semibold text-sm">Discovery</span>
                <h3 className="text-white text-xl font-heading font-bold">New Experiences</h3>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden h-[300px] group"
            >
              <img src={IMAGES.family} alt="Family gathering" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-rose-400 font-semibold text-sm">Family Time</span>
                <h3 className="text-white text-xl font-heading font-bold">Together</h3>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 relative rounded-3xl overflow-hidden h-[300px] group"
            >
              <img src={IMAGES.camping} alt="Family camping" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-emerald-400 font-semibold text-sm">Outdoor Adventures</span>
                <h3 className="text-white text-2xl font-heading font-bold">Nature Escapes</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-[200px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
            7-Day Free Trial
          </span>
          
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to bring your family together?
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of families already planning their next adventure. Start your free trial today—no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-12 py-7 rounded-2xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all hover:scale-105 font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-12 py-7 rounded-2xl">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <p className="text-slate-500 text-sm mt-8 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            No credit card required
            <span className="mx-2">•</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            Cancel anytime
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
