import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, Calendar, DollarSign, Clock, Plus, 
  Trash2, Check, Sparkles, Loader2, Package, ListTodo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PACKING_CATEGORIES = ['Clothing', 'Electronics', 'Toiletries', 'Documents', 'Medicine', 'Entertainment', 'Other'];

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user, family } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Itinerary form
  const [itineraryDay, setItineraryDay] = useState('1');
  const [itineraryTime, setItineraryTime] = useState('');
  const [itineraryActivity, setItineraryActivity] = useState('');
  const [itineraryLocation, setItineraryLocation] = useState('');
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  
  // Packing form
  const [packingItem, setPackingItem] = useState('');
  const [packingCategory, setPackingCategory] = useState('Clothing');
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  
  // Budget form
  const [budgetDescription, setBudgetDescription] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('Transport');
  const [budgetItems, setBudgetItems] = useState([]);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrip();
    fetchBudgetItems();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/trips/${tripId}`);
      setTrip(response.data);
    } catch (error) {
      toast.error('Failed to load trip');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/trips/${tripId}/budget`);
      setBudgetItems(response.data);
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const handleAddItinerary = async (e) => {
    e.preventDefault();
    if (!itineraryActivity || !itineraryTime) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/trips/${tripId}/itinerary`, {
        trip_id: tripId,
        day: parseInt(itineraryDay),
        time: itineraryTime,
        activity: itineraryActivity,
        location: itineraryLocation
      });
      
      toast.success('Activity added!');
      fetchTrip();
      setItineraryDialogOpen(false);
      setItineraryActivity('');
      setItineraryLocation('');
      setItineraryTime('');
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleDeleteItinerary = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/trips/${tripId}/itinerary/${itemId}`);
      fetchTrip();
      toast.success('Activity removed');
    } catch (error) {
      toast.error('Failed to remove activity');
    }
  };

  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!packingItem) {
      toast.error('Please enter an item');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/trips/${tripId}/packing`, {
        trip_id: tripId,
        item: packingItem,
        category: packingCategory,
        packed: false
      });
      
      toast.success('Item added!');
      fetchTrip();
      setPackingDialogOpen(false);
      setPackingItem('');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleTogglePacking = async (itemId) => {
    try {
      await axios.put(`${API_URL}/api/trips/${tripId}/packing/${itemId}`);
      fetchTrip();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!budgetDescription || !budgetAmount) {
      toast.error('Please fill in required fields');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/trips/${tripId}/budget`, {
        trip_id: tripId,
        category: budgetCategory,
        description: budgetDescription,
        amount: parseFloat(budgetAmount),
        currency: 'USD'
      });
      
      toast.success('Expense added!');
      fetchBudgetItems();
      setBudgetDialogOpen(false);
      setBudgetDescription('');
      setBudgetAmount('');
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleGenerateItinerary = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/api/ai/generate-itinerary?trip_id=${tripId}`);
      if (response.data.itinerary) {
        toast.success('Itinerary generated! Check it out.');
        fetchTrip();
      } else if (response.data.response) {
        toast.info('AI suggestions received');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate itinerary');
    } finally {
      setGenerating(false);
    }
  };

  const getTripDays = () => {
    if (!trip) return 1;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalBudgetSpent = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to="/trips" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </span>
              {trip.budget > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${trip.budget.toLocaleString()} budget
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="itinerary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="itinerary" data-testid="itinerary-tab">Itinerary</TabsTrigger>
            <TabsTrigger value="packing" data-testid="packing-tab">Packing</TabsTrigger>
            <TabsTrigger value="budget" data-testid="budget-tab">Budget</TabsTrigger>
          </TabsList>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-primary">Trip Itinerary</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleGenerateItinerary}
                  disabled={generating}
                  data-testid="ai-generate-btn"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  AI Generate
                </Button>
                
                <Dialog open={itineraryDialogOpen} onOpenChange={setItineraryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary" data-testid="add-activity-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Activity</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddItinerary} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Day</Label>
                          <Select value={itineraryDay} onValueChange={setItineraryDay}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: getTripDays() }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  Day {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={itineraryTime}
                            onChange={(e) => setItineraryTime(e.target.value)}
                            className="input-base"
                            data-testid="activity-time-input"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Activity *</Label>
                        <Input
                          placeholder="Visit the Grand Canyon"
                          value={itineraryActivity}
                          onChange={(e) => setItineraryActivity(e.target.value)}
                          className="input-base"
                          data-testid="activity-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          placeholder="Grand Canyon National Park"
                          value={itineraryLocation}
                          onChange={(e) => setItineraryLocation(e.target.value)}
                          className="input-base"
                          data-testid="activity-location-input"
                        />
                      </div>
                      <Button type="submit" className="w-full btn-primary" data-testid="save-activity-btn">
                        Add Activity
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {trip.itinerary?.length === 0 ? (
              <div className="text-center py-12 card-base">
                <ListTodo className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No activities planned yet.</p>
                <p className="text-sm text-muted-foreground">Add activities manually or let AI generate an itinerary for you!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from({ length: getTripDays() }, (_, dayIndex) => {
                  const dayActivities = trip.itinerary?.filter(item => item.day === dayIndex + 1) || [];
                  if (dayActivities.length === 0) return null;
                  
                  return (
                    <motion.div 
                      key={dayIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: dayIndex * 0.1 }}
                      className="card-base p-6"
                    >
                      <h3 className="font-heading font-bold text-lg text-primary mb-4">
                        Day {dayIndex + 1}
                      </h3>
                      <div className="space-y-3">
                        {dayActivities.sort((a, b) => a.time.localeCompare(b.time)).map((item, i) => (
                          <div key={item.id} className="flex items-start gap-4 p-3 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
                              <Clock className="w-4 h-4" />
                              {item.time}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.activity}</p>
                              {item.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.location}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteItinerary(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Packing Tab */}
          <TabsContent value="packing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl text-primary">Packing List</h2>
              
              <Dialog open={packingDialogOpen} onOpenChange={setPackingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" data-testid="add-packing-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Packing Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPackingItem} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Item *</Label>
                      <Input
                        placeholder="Sunscreen"
                        value={packingItem}
                        onChange={(e) => setPackingItem(e.target.value)}
                        className="input-base"
                        data-testid="packing-item-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={packingCategory} onValueChange={setPackingCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PACKING_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full btn-primary" data-testid="save-packing-btn">
                      Add Item
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {trip.packing_list?.length === 0 ? (
              <div className="text-center py-12 card-base">
                <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No items in your packing list yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PACKING_CATEGORIES.map(category => {
                  const items = trip.packing_list?.filter(item => item.category === category) || [];
                  if (items.length === 0) return null;
                  
                  return (
                    <motion.div 
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-base p-6"
                    >
                      <h3 className="font-heading font-bold text-primary mb-4">{category}</h3>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg cursor-pointer"
                            onClick={() => handleTogglePacking(item.id)}
                          >
                            <Checkbox checked={item.packed} />
                            <span className={item.packed ? 'line-through text-muted-foreground' : ''}>
                              {item.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-primary">Budget Tracker</h2>
                <p className="text-muted-foreground">
                  ${totalBudgetSpent.toLocaleString()} spent
                  {trip.budget > 0 && ` of $${trip.budget.toLocaleString()}`}
                </p>
              </div>
              
              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary" data-testid="add-expense-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddBudget} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        placeholder="Flight tickets"
                        value={budgetDescription}
                        onChange={(e) => setBudgetDescription(e.target.value)}
                        className="input-base"
                        data-testid="expense-description-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount *</Label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="input-base"
                          data-testid="expense-amount-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Transport">Transport</SelectItem>
                            <SelectItem value="Accommodation">Accommodation</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Activities">Activities</SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full btn-primary" data-testid="save-expense-btn">
                      Add Expense
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {trip.budget > 0 && (
              <div className="card-base p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Progress</span>
                  <span>{Math.round((totalBudgetSpent / trip.budget) * 100)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      totalBudgetSpent > trip.budget ? 'bg-destructive' : 'bg-accent'
                    }`}
                    style={{ width: `${Math.min((totalBudgetSpent / trip.budget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {budgetItems.length === 0 ? (
              <div className="text-center py-12 card-base">
                <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No expenses recorded yet.</p>
              </div>
            ) : (
              <div className="card-base overflow-hidden">
                <div className="divide-y divide-border">
                  {budgetItems.map((item, index) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="font-heading font-bold text-lg">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
