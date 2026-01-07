import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Users, Calendar, MessageCircle, Plane, Camera, 
  Shield, Sparkles, Globe, Heart, ArrowRight, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Users,
    title: "Family Groups",
    description: "Create private groups for your family. Invite members with secure codes.",
    color: "bg-primary"
  },
  {
    icon: Calendar,
    title: "Trip Planning",
    description: "Collaborative itineraries with AI-powered suggestions and countdowns.",
    color: "bg-secondary"
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Stay connected with instant messaging and travel updates.",
    color: "bg-accent"
  },
  {
    icon: MapPin,
    title: "Location Tracker",
    description: "Consent-based family location sharing with safety alerts.",
    color: "bg-primary"
  },
  {
    icon: Camera,
    title: "Memory Gallery",
    description: "Upload and organize photos with AI-powered albums.",
    color: "bg-secondary"
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Get personalized travel recommendations and itinerary help.",
    color: "bg-accent"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Cape Town, SA",
    quote: "Finally, a way to plan our UK visits with grandparents! Everyone stays in the loop.",
    avatar: "SM"
  },
  {
    name: "James K.",
    location: "London, UK",
    quote: "The AI itinerary generator saved us hours of planning for our safari trip.",
    avatar: "JK"
  },
  {
    name: "Priya R.",
    location: "Mumbai, India",
    quote: "Real-time location tracking gives us peace of mind when traveling with the kids.",
    avatar: "PR"
  }
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-primary">Kinship Journeys</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" data-testid="login-btn">Log In</Button>
              </Link>
              <Link to="/auth">
                <Button className="btn-primary" data-testid="get-started-btn">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 space-y-4"
            >
              <a href="#features" className="block text-muted-foreground hover:text-primary">Features</a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-primary">How It Works</a>
              <a href="#testimonials" className="block text-muted-foreground hover:text-primary">Testimonials</a>
              <Link to="/auth" className="block">
                <Button className="w-full btn-primary">Get Started</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/697244/pexels-photo-697244.jpeg" 
            alt="Family hiking at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Family Travel
              </span>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Plan Adventures.<br />
                Stay Connected.<br />
                <span className="text-secondary">Travel Together.</span>
              </h1>
              
              <p className="text-lg text-white/90 mb-8 max-w-xl">
                The all-in-one platform for families across the globe to plan trips, 
                share memories, and stay connected—no matter the distance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button className="btn-primary text-lg px-10 py-6" data-testid="hero-cta-btn">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full text-lg px-10 py-6">
                    Learn More
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden lg:flex gap-6"
        >
          {[
            { value: "10K+", label: "Families" },
            { value: "50K+", label: "Trips Planned" },
            { value: "120+", label: "Countries" }
          ].map((stat, i) => (
            <div key={i} className="glass px-6 py-4 rounded-2xl text-center">
              <div className="font-heading font-bold text-2xl text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              Everything Your Family Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From planning to memories, we've got every aspect of family travel covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-base card-interactive p-8"
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 px-6 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your family trip planned in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Your Family", desc: "Sign up and invite your family members with a secure code." },
              { step: "2", title: "Plan Together", desc: "Create trips, build itineraries, and let AI assist with suggestions." },
              { step: "3", title: "Travel & Share", desc: "Stay connected with real-time chat, location sharing, and memories." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-3xl font-heading font-bold mx-auto mb-6 shadow-button">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              Loved by Families Worldwide
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-base p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-primary">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.location}</div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{item.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-primary rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4784348/pexels-photo-4784348.jpeg')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <Heart className="w-12 h-12 text-secondary mx-auto mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Plan Your Next Family Adventure?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of families already using Kinship Journeys to create unforgettable travel memories.
            </p>
            <Link to="/auth">
              <Button className="btn-primary text-lg px-12 py-6" data-testid="cta-get-started-btn">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl">Kinship Journeys</span>
            </div>
            <div className="flex gap-6 text-sm text-white/70">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-white/70">© 2024 Kinship Journeys. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
