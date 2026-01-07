import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  MapPin, Users, Calendar, MessageCircle, Plane, Camera, 
  Shield, Sparkles, Globe, Heart, ArrowRight, Menu, X,
  Clock, Wallet, FileText, CloudSun, Map, Gift, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const features = [
  {
    icon: Users,
    title: "Family Groups",
    description: "Create private groups for your family. Invite members with secure codes across the globe.",
    color: "bg-primary"
  },
  {
    icon: Calendar,
    title: "Trip Planning",
    description: "Collaborative itineraries with AI-powered suggestions and live countdowns.",
    color: "bg-secondary"
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Stay connected with instant messaging, location sharing and travel updates.",
    color: "bg-accent"
  },
  {
    icon: Map,
    title: "Live Location Tracking",
    description: "Consent-based family location sharing with history, geofencing and safety alerts.",
    color: "bg-primary"
  },
  {
    icon: Wallet,
    title: "Expense Splitting",
    description: "Track budgets in any currency and split expenses fairly between family members.",
    color: "bg-secondary"
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Store passport details with expiry alerts. Never miss a renewal again.",
    color: "bg-accent"
  },
  {
    icon: CloudSun,
    title: "Weather Forecasts",
    description: "Real-time weather updates for your destination. Pack smart, travel prepared.",
    color: "bg-primary"
  },
  {
    icon: Gift,
    title: "Milestone Tracker",
    description: "Never forget birthdays or anniversaries while traveling. Get timely reminders.",
    color: "bg-secondary"
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Get personalized travel recommendations, itinerary suggestions and local tips.",
    color: "bg-accent"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Cape Town, SA",
    quote: "Finally, a way to plan our UK visits with grandparents! The countdown feature keeps everyone excited.",
    avatar: "SM"
  },
  {
    name: "James K.",
    location: "London, UK",
    quote: "The expense splitting saved us so much hassle on our safari trip. Worth every penny!",
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
  const [pricing, setPricing] = useState(null);
  const [userCurrency, setUserCurrency] = useState('ZAR');

  useEffect(() => {
    // Detect user's likely currency based on timezone/locale
    const detectCurrency = () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('London') || timezone.includes('Europe/London')) {
        return 'GBP';
      } else if (timezone.includes('America')) {
        return 'USD';
      } else if (timezone.includes('Europe')) {
        return 'EUR';
      } else if (timezone.includes('Australia')) {
        return 'AUD';
      }
      return 'ZAR';
    };
    
    const currency = detectCurrency();
    setUserCurrency(currency);
    fetchPricing(currency);
  }, []);

  const fetchPricing = async (currency) => {
    try {
      const response = await axios.get(`${API_URL}/api/pricing?currency=${currency}`);
      setPricing(response.data);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  };

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
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
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
              <a href="#pricing" className="block text-muted-foreground hover:text-primary">Pricing</a>
              <a href="#testimonials" className="block text-muted-foreground hover:text-primary">Testimonials</a>
              <Link to="/auth" className="block">
                <Button className="w-full btn-primary">Get Started</Button>
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Desktop Background */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1503431153573-96e959f4d9b7?w=1920" 
            alt="Family walking together on a nature path"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
        </div>

        {/* Mobile Background - Gradient */}
        <div className="absolute inset-0 z-0 md:hidden bg-gradient-to-b from-secondary/10 via-background to-accent/5">
          <div className="absolute top-20 right-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-secondary/20 md:bg-white/20 backdrop-blur-sm text-secondary md:text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Family Travel
              </span>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary md:text-white leading-tight mb-6">
                Plan Adventures.<br />
                Stay Connected.<br />
                <span className="text-gradient-teal md:text-secondary">Travel Together.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground md:text-white/90 mb-8 max-w-xl">
                The all-in-one platform for families across the globe to plan trips, 
                share memories, and stay connected—no matter the distance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button className="btn-primary text-lg px-10 py-6 w-full sm:w-auto" data-testid="hero-cta-btn">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" className="bg-white/10 border-secondary/30 md:border-white/30 text-primary md:text-white hover:bg-secondary/10 md:hover:bg-white/20 rounded-full text-lg px-10 py-6 w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Pricing Preview */}
              {pricing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground md:text-white/80"
                >
                  <span>Starting at</span>
                  <span className="font-heading font-bold text-lg text-secondary md:text-secondary">
                    {pricing.base_plan.formatted}
                  </span>
                  <span>/month for up to 10 family members</span>
                </motion.div>
              )}
            </motion.div>

            {/* Mobile Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="md:hidden"
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1503431153573-96e959f4d9b7?w=800" 
                  alt="Family adventure"
                  className="w-full h-64 object-cover rounded-3xl shadow-2xl"
                />
                {/* Countdown Preview Card */}
                <div className="absolute -bottom-6 -right-2 bg-white rounded-2xl shadow-xl p-4 w-48">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="w-3 h-3 text-secondary" />
                    Next Trip
                  </div>
                  <div className="font-heading font-bold text-primary">Safari Adventure</div>
                  <div className="text-2xl font-bold text-secondary">12 days</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats - Desktop Only */}
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
      <section id="features" className="py-20 md:py-32 px-6 bg-gradient-to-b from-background to-secondary/5">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
                data-testid={`feature-card-${index}`}
              >
                <div className="feature-card-inner">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              Simple, Family-Friendly Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              One plan for the whole family. Displayed in your local currency.
            </p>
          </motion.div>

          {pricing ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white rounded-3xl shadow-xl border border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
                  <h3 className="font-heading text-2xl font-bold mb-2">{pricing.base_plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-heading font-bold">{pricing.base_plan.formatted}</span>
                    <span className="text-white/80">/{pricing.base_plan.period}</span>
                  </div>
                  <p className="mt-2 text-white/80">{pricing.base_plan.description}</p>
                </div>
                
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {pricing.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-secondary" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-primary">Need more members?</strong><br />
                      Add {pricing.extra_members.formatted} per {pricing.extra_members.per} additional members/month
                    </p>
                  </div>
                  
                  <Link to="/auth">
                    <Button className="w-full btn-primary text-lg py-6" data-testid="pricing-cta-btn">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent mx-auto"></div>
            </div>
          )}

          {/* Currency Selector */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">View pricing in:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['ZAR', 'USD', 'GBP', 'EUR', 'AUD'].map(curr => (
                <button
                  key={curr}
                  onClick={() => { setUserCurrency(curr); fetchPricing(curr); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    userCurrency === curr 
                      ? 'bg-secondary text-white' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-secondary/5 to-background">
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
              { step: "1", title: "Create Your Family", desc: "Sign up and invite your family members with a secure code.", img: "https://images.unsplash.com/photo-1764816652596-8cbcd9f7f891?w=400" },
              { step: "2", title: "Plan Together", desc: "Create trips, build itineraries, and let AI assist with suggestions.", img: "https://images.pexels.com/photos/10433247/pexels-photo-10433247.jpeg?w=400" },
              { step: "3", title: "Travel & Share", desc: "Stay connected with real-time chat, location sharing, and memories.", img: "https://images.unsplash.com/photo-1461870083782-4d7b4f364728?w=400" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <img 
                    src={item.img} 
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center text-xl font-heading font-bold shadow-button">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-3 mt-6">{item.title}</h3>
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
                  <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
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
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
        >
          <img 
            src="https://images.pexels.com/photos/2833394/pexels-photo-2833394.jpeg" 
            alt="Family on beach"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
          <div className="relative z-10 p-10 md:p-16 text-center text-white">
            <Heart className="w-12 h-12 mx-auto mb-6 text-white/80" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Ready to Plan Your Next Family Adventure?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of families already using Kinship Journeys to create unforgettable travel memories.
            </p>
            <Link to="/auth">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-full text-lg px-12 py-6 font-bold" data-testid="cta-get-started-btn">
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
            <p className="text-sm text-white/70">© 2026 Kinship Journeys. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
