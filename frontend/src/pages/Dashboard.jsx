import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Globe, MapPin, Calendar, Users, MessageCircle, Sparkles, 
  Plus, Copy, Check, Plane, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, family, logout, createFamily, joinFamily, refreshFamily } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Family creation/join form
  const [familyName, setFamilyName] = useState('');
  const [familyDescription, setFamilyDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, [family]);

  const fetchTrips = async () => {
    try {
      if (family) {
        const response = await axios.get(`${API_URL}/api/trips`);
        setTrips(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
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

  const getDaysUntilTrip = (startDate) => {
    const today = new Date();
    const tripDate = new Date(startDate);
    const diffTime = tripDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // No family view
  if (!family) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} onLogout={handleLogout} />
        
        <div className="max-w-4xl mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
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
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            {family.name}
          </h1>
          <p className="text-muted-foreground">{family.description || 'Family travel hub'}</p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Family Members - Spans 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base p-6 md:col-span-2"
            data-testid="family-members-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                <Users className="w-5 h-5" />
                Family Members
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyInviteCode}
                className="text-sm"
                data-testid="copy-invite-btn"
              >
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {family.invite_code}
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {family.member_details?.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                  {member.role === 'admin' && (
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-6 md:col-span-2"
            data-testid="quick-actions-card"
          >
            <h2 className="font-heading font-bold text-lg text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/trips">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="plan-trip-btn">
                  <Plane className="w-6 h-6 text-secondary" />
                  <span>Plan Trip</span>
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="family-chat-btn">
                  <MessageCircle className="w-6 h-6 text-accent" />
                  <span>Family Chat</span>
                </Button>
              </Link>
              <Link to="/ai-assistant">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="ai-assistant-btn">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span>AI Assistant</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="settings-btn">
                  <Settings className="w-6 h-6 text-muted-foreground" />
                  <span>Settings</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Upcoming Trips - Spans full width */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-base p-6 md:col-span-4"
            data-testid="upcoming-trips-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-lg text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Trips
              </h2>
              <Link to="/trips">
                <Button className="btn-primary" data-testid="create-trip-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  New Trip
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No trips planned yet. Start your first adventure!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip, index) => {
                  const daysUntil = getDaysUntilTrip(trip.start_date);
                  return (
                    <Link key={trip.id} to={`/trips/${trip.id}`}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="card-base card-interactive p-5"
                        data-testid={`trip-card-${index}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-heading font-bold text-primary">{trip.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.destination}
                            </p>
                          </div>
                          {daysUntil > 0 && (
                            <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-bold">
                              {daysUntil} days
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
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
    </div>
  );
}

// Navbar Component
function Navbar({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-primary hidden sm:block">Kinship Journeys</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {user?.name}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
