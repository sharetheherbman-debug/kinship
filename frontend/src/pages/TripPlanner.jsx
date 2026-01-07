import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Globe, MapPin, Calendar, Plus, Plane, ArrowLeft, 
  Trash2, Edit, DollarSign, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function TripPlanner() {
  const navigate = useNavigate();
  const { user, family } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (!family) {
      navigate('/dashboard');
      return;
    }
    fetchTrips();
  }, [family, navigate]);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/trips`);
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripName || !destination || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API_URL}/api/trips`, {
        name: tripName,
        destination: destination,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        description: description,
        budget: parseFloat(budget) || 0
      });
      
      toast.success('Trip created successfully!');
      setTrips([...trips, response.data]);
      setDialogOpen(false);
      resetForm();
      
      // Navigate to the new trip
      navigate(`/trips/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create trip');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTrip = async (tripId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/trips/${tripId}`);
      setTrips(trips.filter(t => t.id !== tripId));
      toast.success('Trip deleted');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const resetForm = () => {
    setTripName('');
    setDestination('');
    setDescription('');
    setBudget('');
    setStartDate(null);
    setEndDate(null);
  };

  const getDaysUntilTrip = (date) => {
    const today = new Date();
    const tripDate = new Date(date);
    const diffTime = tripDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-primary">Trip Planner</span>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="new-trip-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  New Trip
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Plan a New Adventure</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreateTrip} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="trip-name">Trip Name *</Label>
                    <Input
                      id="trip-name"
                      placeholder="Summer Safari Adventure"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="input-base"
                      data-testid="trip-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="destination"
                        placeholder="Cape Town, South Africa"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 input-base"
                        data-testid="destination-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-left font-normal input-base"
                            data-testid="start-date-btn"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-left font-normal input-base"
                            data-testid="end-date-btn"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'MMM dd, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => startDate && date < startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="5000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="pl-10 input-base"
                        data-testid="budget-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your trip plans..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-base min-h-[80px]"
                      data-testid="description-input"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={creating}
                    data-testid="create-trip-submit-btn"
                  >
                    {creating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plane className="w-4 h-4 mr-2" />
                        Create Trip
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : trips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plane className="w-12 h-12 text-secondary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-primary mb-4">
              No Trips Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start planning your family's next adventure. Create a trip and invite everyone to collaborate!
            </p>
            <Button 
              className="btn-primary"
              onClick={() => setDialogOpen(true)}
              data-testid="empty-state-new-trip-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Plan Your First Trip
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => {
              const daysUntil = getDaysUntilTrip(trip.start_date);
              const isPast = daysUntil < 0;
              
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/trips/${trip.id}`}>
                    <div 
                      className={`card-base card-interactive p-6 h-full ${isPast ? 'opacity-70' : ''}`}
                      data-testid={`trip-card-${index}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-xl text-primary mb-1">
                            {trip.name}
                          </h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {trip.destination}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          data-testid={`delete-trip-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {trip.budget > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>${trip.budget.toLocaleString()} budget</span>
                          </div>
                        )}

                        {!isPast && daysUntil >= 0 && (
                          <div className="mt-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              daysUntil <= 7 ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent'
                            }`}>
                              {daysUntil === 0 ? 'Today!' : `${daysUntil} days to go`}
                            </div>
                          </div>
                        )}

                        {isPast && (
                          <div className="mt-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                              Trip completed
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
