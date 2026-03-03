import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Settings as SettingsIcon, User, Copy, Check, 
  CreditCard, LogOut, Loader2, Crown, Share2, Link as LinkIcon, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PLANS = [
  { id: 'monthly', name: 'Monthly Premium', price: '$9.99/month', description: 'Full access to all features' },
  { id: 'yearly', name: 'Yearly Premium', price: '$99.99/year', description: 'Save $20 with annual billing' },
];

const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourprofile' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { id: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, family, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [upgrading, setUpgrading] = useState(null);
  const [socialProfiles, setSocialProfiles] = useState({});
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialSaving, setSocialSaving] = useState(null);

  useEffect(() => {
    fetchSocialProfiles();
  }, []);

  const fetchSocialProfiles = async () => {
    setSocialLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/user/social`);
      const map = {};
      res.data.forEach(p => { map[p.platform] = p.profile_url || ''; });
      setSocialProfiles(map);
    } catch {
      // silently ignore if not authenticated yet
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSaveSocial = async (platform) => {
    setSocialSaving(platform);
    try {
      const url = socialProfiles[platform] || '';
      await axios.post(`${API_URL}/api/user/social`, {
        platform,
        profile_url: url,
        connected: !!url,
      });
      toast.success(`${platform} profile saved!`);
    } catch {
      toast.error('Failed to save social profile');
    } finally {
      setSocialSaving(null);
    }
  };

  const handleRemoveSocial = async (platform) => {
    try {
      await axios.delete(`${API_URL}/api/user/social/${platform}`);
      setSocialProfiles(prev => ({ ...prev, [platform]: '' }));
      toast.success(`${platform} profile removed`);
    } catch {
      toast.error('Failed to remove social profile');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(family?.invite_code || '');
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgrade = async (planId) => {
    setUpgrading(planId);
    try {
      const response = await axios.post(`${API_URL}/api/payments/checkout`, {
        plan: planId,
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start checkout');
      setUpgrading(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-heading font-bold text-xl text-primary">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-6"
          data-testid="profile-section"
        >
          <h2 className="font-heading font-bold text-lg text-primary mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/20 text-accent mt-1">
                  {user?.role || 'Member'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Social Media Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-base p-6"
          data-testid="social-section"
        >
          <h2 className="font-heading font-bold text-lg text-primary mb-6 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Social Media Accounts
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Link your social media profiles to share trips and memories with friends and family.
          </p>

          {socialLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map(({ id, label, placeholder }) => (
                <div key={id} className="space-y-2">
                  <Label className="text-muted-foreground">{label}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder={placeholder}
                        value={socialProfiles[id] || ''}
                        onChange={e => setSocialProfiles(prev => ({ ...prev, [id]: e.target.value }))}
                        className="pl-9 input-base"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveSocial(id)}
                      disabled={socialSaving === id}
                    >
                      {socialSaving === id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    {socialProfiles[id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSocial(id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Family Section */}
        {family && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base p-6"
            data-testid="family-section"
          >
            <h2 className="font-heading font-bold text-lg text-primary mb-6">Family Settings</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground">Family Name</Label>
                <p className="font-medium text-lg">{family.name}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Invite Code</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    value={family.invite_code} 
                    readOnly 
                    className="input-base font-mono text-lg tracking-wider max-w-[200px]"
                  />
                  <Button 
                    variant="outline" 
                    onClick={copyInviteCode}
                    data-testid="copy-invite-code-btn"
                  >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this code with family members to invite them
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-muted-foreground mb-3 block">Members ({family.member_details?.length || 0})</Label>
                <div className="space-y-2">
                  {family.member_details?.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {member.role === 'admin' && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">Admin</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Premium Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-base p-6"
          data-testid="premium-section"
        >
          <h2 className="font-heading font-bold text-lg text-primary mb-6 flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" />
            Premium Plans
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Upgrade to Premium for unlimited trips, AI itinerary generation, priority support, and more!
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                className="border border-border rounded-2xl p-6 hover:border-secondary/50 transition-colors"
              >
                <h3 className="font-heading font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-2xl font-bold text-secondary mb-2">{plan.price}</p>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <Button 
                  className="w-full btn-primary"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading !== null}
                  data-testid={`upgrade-${plan.id}-btn`}
                >
                  {upgrading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Logout Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-base p-6"
        >
          <h2 className="font-heading font-bold text-lg text-primary mb-4">Account Actions</h2>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
