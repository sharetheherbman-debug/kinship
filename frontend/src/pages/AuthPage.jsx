import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Globe, Mail, Lock, User, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerCurrency, setRegisterCurrency] = useState('ZAR');
  const [registerCountry, setRegisterCountry] = useState('ZA');

  // Auto-detect currency based on timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('London') || timezone.includes('Europe/London')) {
      setRegisterCurrency('GBP');
      setRegisterCountry('GB');
    } else if (timezone.includes('America')) {
      setRegisterCurrency('USD');
      setRegisterCountry('US');
    } else if (timezone.includes('Europe')) {
      setRegisterCurrency('EUR');
      setRegisterCountry('EU');
    } else if (timezone.includes('Australia')) {
      setRegisterCurrency('AUD');
      setRegisterCountry('AU');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(registerName, registerEmail, registerPassword, registerCountry, registerCurrency);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="https://images.pexels.com/photos/3811863/pexels-photo-3811863.jpeg" 
          alt="Friends planning a trip"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-heading text-4xl font-bold mb-6">
                Your Family's Travel Hub
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Plan trips together, share memories, and stay connected no matter where life takes you.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm">Family Groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-sm">Global Access</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-primary">Amarktai Network</span>
          </Link>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="login-tab">Log In</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-primary mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Log in to continue your family's journey</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 input-base"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 input-base"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      data-testid="login-password-input"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Log In
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-primary mb-2">Create Account</h2>
                <p className="text-muted-foreground">Start planning your family adventures</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 input-base"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      data-testid="register-name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 input-base"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      data-testid="register-email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 input-base"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      data-testid="register-password-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 input-base"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      data-testid="register-confirm-password-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Currency</Label>
                  <Select value={registerCurrency} onValueChange={setRegisterCurrency}>
                    <SelectTrigger className="input-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Prices will be shown in your currency</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary"
                  disabled={loading}
                  data-testid="register-submit-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
