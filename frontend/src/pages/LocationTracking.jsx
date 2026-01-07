import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Map, MapPin, Navigation, Battery, Clock,
  Shield, Bell, Settings, Loader2, RefreshCw, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LocationTracking() {
  const { user, family } = useAuth();
  const [locations, setLocations] = useState([]);
  const [settings, setSettings] = useState({
    enabled: false,
    share_with_family: true,
    geofence_alerts: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (family) {
      fetchData();
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [family]);

  const fetchData = async () => {
    try {
      const [locRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/tracking/family/${family.id}`),
        axios.get(`${API_URL}/api/tracking/settings`)
      ]);
      
      setLocations(locRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/api/tracking/settings`, newSettings);
      setSettings(newSettings);
      
      if (newSettings.enabled && !watchId) {
        startTracking();
      } else if (!newSettings.enabled && watchId) {
        stopTracking();
      }
      
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await axios.post(`${API_URL}/api/tracking/location`, {
            family_id: family.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            battery_level: navigator.getBattery ? (await navigator.getBattery()).level * 100 : 100
          });
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
    
    setWatchId(id);
    toast.success('Location tracking started');
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      toast.success('Location tracking stopped');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-primary">Family Tracker</h1>
                <p className="text-xs text-muted-foreground">Real-time location sharing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="map" data-testid="map-tab">Live Map</TabsTrigger>
            <TabsTrigger value="history" data-testid="history-tab">History</TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">Settings</TabsTrigger>
          </TabsList>

          {/* Live Map Tab */}
          <TabsContent value="map" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base p-6"
            >
              {/* Map Placeholder - Would integrate with Leaflet/Google Maps */}
              <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl h-64 md:h-96 flex items-center justify-center mb-6">
                <div className="text-center">
                  <Map className="w-16 h-16 text-secondary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive map view</p>
                  <p className="text-sm text-muted-foreground">Showing {locations.length} family members</p>
                </div>
              </div>

              {/* Family Members Locations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-primary">Family Locations</h3>
                  <Button variant="ghost" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {locations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No family members are currently sharing their location</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations.map((loc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                          {loc.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{loc.user_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(loc.timestamp)}
                          </div>
                          {loc.battery_level && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Battery className="w-3 h-3" />
                              {loc.battery_level}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base p-6"
            >
              <h3 className="font-heading font-bold text-primary mb-4">Location History</h3>
              <div className="text-center py-12">
                <Navigation className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Location history will appear here</p>
                <p className="text-sm text-muted-foreground">Track past movements over the last 7 days</p>
              </div>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base p-6"
            >
              <h3 className="font-heading font-bold text-primary mb-6">Tracking Settings</h3>
              
              <div className="space-y-6">
                {/* Enable Tracking */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <Label className="font-medium">Enable Location Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share your location with family</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSettings({ ...settings, enabled: checked })}
                    disabled={updating}
                    data-testid="enable-tracking-switch"
                  />
                </div>

                {/* Share with Family */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <Label className="font-medium">Share with All Family</Label>
                      <p className="text-sm text-muted-foreground">All members can see your location</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.share_with_family}
                    onCheckedChange={(checked) => updateSettings({ ...settings, share_with_family: checked })}
                    disabled={updating || !settings.enabled}
                    data-testid="share-family-switch"
                  />
                </div>

                {/* Geofence Alerts */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="font-medium">Geofence Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when family arrives/leaves areas</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.geofence_alerts}
                    onCheckedChange={(checked) => updateSettings({ ...settings, geofence_alerts: checked })}
                    disabled={updating || !settings.enabled}
                    data-testid="geofence-switch"
                  />
                </div>

                {/* Privacy Notice */}
                <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-xl">
                  <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-primary">Privacy First</p>
                    <p className="text-sm text-muted-foreground">
                      Location sharing is consent-based. You control who sees your location and can disable sharing at any time. Data is encrypted and never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
