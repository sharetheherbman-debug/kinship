import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  MapPin, Shield, CheckCircle, XCircle, Loader2, Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const LOCATION_INTERVAL_MS = 30000; // Send location every 30 seconds

export default function PhoneTrackingApproval() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tracking/phone/approve/${token}`);
        setInfo(res.data);
        if (res.data.approved && res.data.active) {
          setApproved(true);
          startSendingLocation();
        }
      } catch (error) {
        toast.error('Invalid or expired tracking link');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const approve = async () => {
    setApproving(true);
    try {
      await axios.post(`${API_URL}/api/tracking/phone/approve/${token}`);
      setApproved(true);
      setInfo(prev => ({ ...prev, approved: true, active: true }));
      toast.success('Location sharing approved!');
      startSendingLocation();
    } catch (error) {
      toast.error('Failed to approve. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const revoke = async () => {
    setRevoking(true);
    try {
      await axios.post(`${API_URL}/api/tracking/phone/revoke/${token}`);
      setApproved(false);
      setTracking(false);
      setInfo(prev => ({ ...prev, active: false }));
      if (intervalRef.current) clearInterval(intervalRef.current);
      toast.success('Location sharing stopped');
    } catch (error) {
      toast.error('Failed to stop sharing. Please try again.');
    } finally {
      setRevoking(false);
    }
  };

  const sendLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          let batteryLevel = 100;
          if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            batteryLevel = Math.round(battery.level * 100);
          }
          await axios.post(`${API_URL}/api/tracking/phone/location`, {
            token,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            battery_level: batteryLevel
          });
          setLastUpdate(new Date().toLocaleTimeString());
          setTracking(true);
        } catch (error) {
          console.error('Location update failed:', error);
        }
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const startSendingLocation = () => {
    sendLocation(); // send immediately
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(sendLocation, LOCATION_INTERVAL_MS);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-primary mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">This tracking link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary">Location Sharing</h1>
          <p className="text-muted-foreground mt-2">
            <span className="font-semibold">{info.inviter_name}</span> from{' '}
            <span className="font-semibold">{info.family_name}</span> wants to see your location
          </p>
        </div>

        {/* Status Card */}
        <div className="card-base p-6 mb-6">
          {approved && info.active ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Sharing Active</p>
                  {lastUpdate && (
                    <p className="text-xs text-green-600">Last update: {lastUpdate}</p>
                  )}
                  {!tracking && (
                    <p className="text-xs text-green-600 animate-pulse">Getting your location…</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="w-4 h-4" />
                <span>Your location updates every 30 seconds</span>
              </div>
              <Button
                onClick={revoke}
                disabled={revoking}
                variant="destructive"
                className="w-full"
                data-testid="revoke-btn"
              >
                {revoking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Stop Sharing My Location
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-xl">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Your location will be shared with your family. You can stop sharing at any time by tapping the link again.
                </p>
              </div>
              <Button
                onClick={approve}
                disabled={approving}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                data-testid="approve-btn"
              >
                {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Approve Location Sharing
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Kinship Journeys · Your privacy is protected · Consent-based tracking only
        </p>
      </motion.div>
    </div>
  );
}
