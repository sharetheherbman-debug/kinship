import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Map, MapPin, Navigation, Battery, Clock,
  Shield, Bell, Settings, Loader2, RefreshCw, Users,
  Phone, Send, Trash2, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

  // Phone tracking state
  const [phoneTrackers, setPhoneTrackers] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memberName, setMemberName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (family) {
      fetchData();
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [family]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [locRes, settingsRes, phoneRes] = await Promise.all([
        axios.get(`${API_URL}/api/tracking/family/${family.id}`),
        axios.get(`${API_URL}/api/tracking/settings`),
        axios.get(`${API_URL}/api/tracking/phones/${family.id}`)
      ]);
      
      setLocations(locRes.data);
      setSettings(settingsRes.data);
      setPhoneTrackers(phoneRes.data);
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

  const sendPhoneInvite = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    setSendingInvite(true);
    try {
      const res = await axios.post(`${API_URL}/api/tracking/phone/invite`, {
        phone_number: phoneNumber.trim(),
        member_name: memberName.trim() || phoneNumber.trim(),
        family_id: family.id
      });
      toast.success(res.data.message);
      if (!res.data.sms_sent) {
        // Copy approval link to clipboard as fallback
        if (res.data.approval_link) {
          navigator.clipboard?.writeText(res.data.approval_link).catch(() => {});
          toast.info('Approval link copied to clipboard (SMS not configured)');
        }
      }
      setPhoneNumber('');
      setMemberName('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const removePhoneTracker = async (phoneId) => {
    try {
      await axios.delete(`${API_URL}/api/tracking/phones/${phoneId}`);
      toast.success('Phone tracker removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove phone tracker');
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

  const allLocations = [
    ...locations,
    ...phoneTrackers
      .filter(p => p.last_location && p.active)
      .map(p => ({
        user_name: p.member_name,
        latitude: p.last_location.latitude,
        longitude: p.last_location.longitude,
        timestamp: p.last_location.timestamp,
        battery_level: p.last_location.battery_level,
        source: 'phone'
      }))
  ];

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
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="map" data-testid="map-tab">Live Map</TabsTrigger>
            <TabsTrigger value="phones" data-testid="phones-tab">📱 Phones</TabsTrigger>
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
                  <p className="text-sm text-muted-foreground">Showing {allLocations.length} family members</p>
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

                {allLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No family members are currently sharing their location</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allLocations.map((loc, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className={`w-10 h-10 ${loc.source === 'phone' ? 'bg-accent' : 'bg-secondary'} text-white rounded-full flex items-center justify-center font-bold`}>
                          {loc.source === 'phone' ? <Phone className="w-4 h-4" /> : loc.user_name?.charAt(0).toUpperCase()}
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

          {/* Phone Tracking Tab */}
          <TabsContent value="phones" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base p-6"
            >
              <h3 className="font-heading font-bold text-primary mb-2">Cell Phone Tracking</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Invite a family member's phone by entering their number. They'll receive an SMS with an approval link. Once they approve, their phone's location will show on the map.
              </p>

              {/* Invite Form */}
              <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-3">
                <div>
                  <Label className="mb-1 block">Phone Number (E.164 format, e.g. +27821234567)</Label>
                  <Input
                    placeholder="+27821234567"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    data-testid="phone-number-input"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Member Name (optional)</Label>
                  <Input
                    placeholder="e.g. Dad's Phone"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    data-testid="member-name-input"
                  />
                </div>
                <Button
                  onClick={sendPhoneInvite}
                  disabled={sendingInvite || !phoneNumber.trim()}
                  className="w-full"
                  data-testid="send-invite-btn"
                >
                  {sendingInvite ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send SMS Invite
                </Button>
              </div>

              {/* Privacy Notice */}
              <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-xl mb-6">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Consent-based:</span> The phone owner must tap the link in the SMS and approve sharing. They can revoke at any time.
                </p>
              </div>

              {/* Phone Trackers List */}
              <h4 className="font-heading font-semibold text-primary mb-3">Invited Phones</h4>
              {phoneTrackers.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No phone invites sent yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {phoneTrackers.map((tracker) => (
                    <div key={tracker.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="w-10 h-10 bg-accent/20 text-accent rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{tracker.member_name}</p>
                        <p className="text-sm text-muted-foreground">{tracker.phone_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {tracker.approved && tracker.active ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : tracker.approved && !tracker.active ? (
                          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Paused
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePhoneTracker(tracker.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`remove-phone-${tracker.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
