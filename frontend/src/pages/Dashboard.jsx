import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Globe, MapPin, Calendar, Users, MessageCircle, Sparkles, 
  Plus, Copy, Check, Plane, Settings, LogOut, ChevronRight,
  Clock, FileText, Map, CloudSun, Gift, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Footer from '@/components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Countdown Timer Component
function CountdownTimer({ targetDate, tripName, destination }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="countdown-card text-white">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
          <Clock className="w-4 h-4" />
          <span>Until your next adventure</span>
        </div>
        <h3 className="font-heading font-bold text-xl mb-1">{tripName}</h3>
        <p className="text-white/80 text-sm flex items-center gap-1 mb-4">
          <MapPin className="w-3 h-3" />
          {destination}
        </p>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Mins' },
            { value: timeLeft.seconds, label: 'Secs' }
          ].map((item, i) => (
            <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="font-heading font-bold text-2xl md:text-3xl animate-countdown">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-white/70">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, family, logout, createFamily, joinFamily, refreshFamily } = useAuth();
  const [trips, setTrips] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Family creation/join form
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (family) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [family]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const [tripsRes, milestonesRes, docsRes] = await Promise.all([
        axios.get(`${API_URL}/api/trips`),
        axios.get(`${API_URL}/api/milestones/${family.id}/upcoming`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/documents/${family.id}/expiring`).catch(() => ({ data: [] }))
      ]);
      
      setTrips(tripsRes.data);
      setMilestones(milestonesRes.data);
      setExpiringDocs(docsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!familyName) {
      toast.error('Please enter a family name');
      return;
    }
    try {
      await createFamily(familyName, familyDescription);
      toast.success('Family created successfully!');
      setDialogOpen(false);
      setFamilyName('');
      setFamilyDescription('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create family');
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    if (!inviteCode) {
      toast.error('Please enter an invite code');
      return;
    }
    try {
      await joinFamily(inviteCode);
      toast.success('Successfully joined family!');
      setDialogOpen(false);
      setInviteCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join family');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(family?.invite_code || '');
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get next upcoming trip
  const getNextTrip = () => {
    const now = new Date();
    const upcomingTrips = trips
      .filter(t => new Date(t.start_date) > now)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    return upcomingTrips[0];
  };

  const nextTrip = getNextTrip();

  // No family view
  if (!family) {
    return (
      <div className="min-h-screen bg-background mobile-gradient-bg">
        <Navbar user={user} onLogout={handleLogout} />
        
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-primary mb-4">
              Welcome, {user?.name}!
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Create a family group or join an existing one to start planning your adventures together.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="setup-family-btn">
                  Set Up Your Family
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Family Setup</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="create" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Family</TabsTrigger>
                    <TabsTrigger value="join">Join Family</TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-4 mt-4">
                    <form onSubmit={handleCreateFamily} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="family-name">Family Name</Label>
                        <Input
                          id="family-name"
                          placeholder="The Wanderlust Family"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          className="input-base"
                          data-testid="family-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="family-description">Description (Optional)</Label>
                        <Input
                          id="family-description"
                          placeholder="Adventure seekers from around the world"
                          value={familyDescription}
                          onChange={(e) => setFamilyDescription(e.target.value)}
                          className="input-base"
                          data-testid="family-description-input"
                        />
                      </div>
                      <Button type="submit" className="w-full btn-primary" data-testid="create-family-btn">
                        Create Family
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="join" className="space-y-4 mt-4">
                    <form onSubmit={handleJoinFamily} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-code">Invite Code</Label>
                        <Input
                          id="invite-code"
                          placeholder="Enter 8-character code"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          className="input-base uppercase"
                          maxLength={8}
                          data-testid="invite-code-input"
                        />
                      </div>
                      <Button type="submit" className="w-full btn-primary" data-testid="join-family-btn">
                        Join Family
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard with family
  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-1">
            {family.name}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">{family.description || 'Family travel hub'}</p>
        </motion.div>

        {/* Mobile-first Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Countdown Timer - Full width on mobile, 2 cols on desktop */}
          {nextTrip && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
              data-testid="countdown-card"
            >
              <CountdownTimer 
                targetDate={nextTrip.start_date}
                tripName={nextTrip.name}
                destination={nextTrip.destination}
              />
            </motion.div>
          )}

          {/* Family Members */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`card-base p-5 md:p-6 ${nextTrip ? 'md:col-span-2' : 'md:col-span-4'}`}
            data-testid="family-members-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-base md:text-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Family Members
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyInviteCode}
                className="text-xs md:text-sm"
                data-testid="copy-invite-btn"
              >
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {family.invite_code}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {family.member_details?.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary/10 rounded-full px-3 py-1.5">
                  <div className="w-7 h-7 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                  {member.role === 'admin' && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions - Mobile optimized grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-5 md:p-6 md:col-span-2"
            data-testid="quick-actions-card"
          >
            <h2 className="font-heading font-bold text-base md:text-lg text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">
              {[
                { to: '/trips', icon: Plane, label: 'Trips', color: 'text-secondary' },
                { to: '/chat', icon: MessageCircle, label: 'Chat', color: 'text-accent' },
                { to: '/ai-assistant', icon: Sparkles, label: 'AI', color: 'text-primary' },
                { to: '/tracking', icon: Map, label: 'Track', color: 'text-secondary' },
                { to: '/documents', icon: FileText, label: 'Docs', color: 'text-accent' },
                { to: '/settings', icon: Settings, label: 'Settings', color: 'text-muted-foreground' },
              ].map((item, i) => (
                <Link key={i} to={item.to}>
                  <Button variant="outline" className="w-full h-auto py-3 md:py-4 flex flex-col gap-1 md:gap-2 text-xs md:text-sm" data-testid={`quick-action-${item.label.toLowerCase()}`}>
                    <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Alerts Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card-base p-5 md:p-6 md:col-span-2"
            data-testid="alerts-card"
          >
            <h2 className="font-heading font-bold text-base md:text-lg text-primary mb-4">Alerts & Reminders</h2>
            <div className="space-y-3">
              {/* Expiring Documents */}
              {expiringDocs.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-xl">
                  <FileText className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-destructive">Document Expiring Soon</p>
                    <p className="text-xs text-muted-foreground">
                      {expiringDocs[0].doc_type} expires in {expiringDocs[0].days_until_expiry} days
                    </p>
                  </div>
                </div>
              )}
              
              {/* Upcoming Milestones */}
              {milestones.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl">
                  <Gift className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-primary">{milestones[0].title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(milestones[0].upcoming_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {expiringDocs.length === 0 && milestones.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No alerts at this time</p>
              )}
            </div>
          </motion.div>

          {/* Upcoming Trips - Full width */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base p-5 md:p-6 md:col-span-4"
            data-testid="upcoming-trips-card"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-heading font-bold text-base md:text-lg text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Upcoming Trips
              </h2>
              <Link to="/trips">
                <Button className="btn-primary text-sm" data-testid="create-trip-btn">
                  <Plus className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">New Trip</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent"></div>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-secondary/50" />
                </div>
                <p className="text-muted-foreground">No trips planned yet. Start your first adventure!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {trips.slice(0, 6).map((trip, index) => {
                  const daysUntil = Math.ceil((new Date(trip.start_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isPast = daysUntil < 0;
                  
                  return (
                    <Link key={trip.id} to={`/trips/${trip.id}`}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`card-base card-interactive p-4 md:p-5 ${isPast ? 'opacity-60' : ''}`}
                        data-testid={`trip-card-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-bold text-primary truncate">{trip.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{trip.destination}</span>
                            </p>
                          </div>
                          {!isPast && daysUntil >= 0 && (
                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
                              daysUntil <= 7 ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                            }`}>
                              {daysUntil}d
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Navbar Component
function Navbar({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-lg md:text-xl text-primary hidden sm:block">Amarktai Network</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive h-9 w-9"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
