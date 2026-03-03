import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Shield, Users, CreditCard, Database, Key, 
  Loader2, RefreshCw, Trash2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Admin login
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Data
  const [users, setUsers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user?.is_superadmin || user?.role === 'superadmin') {
      setIsAdmin(true);
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, familiesRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/users`),
        axios.get(`${API_URL}/api/admin/families`),
        axios.get(`${API_URL}/api/admin/payments`)
      ]);
      
      setUsers(usersRes.data);
      setFamilies(familiesRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: adminEmail,
        password: adminPassword
      });
      
      if (response.data.user.is_superadmin || response.data.user.role === 'superadmin') {
        localStorage.setItem('amarktai_token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsAdmin(true);
        fetchAdminData();
        toast.success('Admin access granted');
      } else {
        toast.error('This account does not have admin privileges');
      }
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  const setupAdmin = async () => {
    const secret = prompt('Enter admin setup secret:');
    if (!secret) return;
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/setup?secret=${secret}`);
      toast.success(response.data.message);
      if (response.data.email) {
        toast.info(`Admin email: ${response.data.email}, Password: ${response.data.password}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Setup failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin login form
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-primary">Admin Access</h1>
            <p className="text-muted-foreground mt-2">This area is restricted to administrators only.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="card-base p-6 space-y-4">
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@amarktainetwork.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="input-base"
                data-testid="admin-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="input-base"
                data-testid="admin-password-input"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={adminLoading}
              data-testid="admin-login-btn"
            >
              {adminLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Admin Panel'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Button variant="link" onClick={setupAdmin} className="text-muted-foreground">
              <Key className="w-4 h-4 mr-2" />
              Setup Admin Account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="font-heading text-2xl font-bold">Admin Panel</h1>
              <p className="text-white/70 text-sm">Amarktai Network Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Users', value: users.length, color: 'bg-primary' },
            { icon: Users, label: 'Families', value: families.length, color: 'bg-accent' },
            { icon: CreditCard, label: 'Transactions', value: payments.length, color: 'bg-secondary' },
            { icon: Database, label: 'Active Today', value: users.filter(u => {
              const created = new Date(u.created_at);
              const today = new Date();
              return created.toDateString() === today.toDateString();
            }).length, color: 'bg-primary' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-base p-6"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="font-heading font-bold text-3xl">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="families">Families</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="card-base p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-lg">All Users</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-base w-[200px]"
                    />
                  </div>
                  <Button variant="outline" onClick={fetchAdminData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Family</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'superadmin' ? 'bg-destructive/20 text-destructive' :
                            user.role === 'admin' ? 'bg-secondary/20 text-secondary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {user.role || 'member'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {user.family_id ? 'Yes' : 'No'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="families">
            <div className="card-base p-6">
              <h2 className="font-heading font-bold text-lg mb-6">All Families</h2>
              
              <div className="space-y-4">
                {families.map((family) => (
                  <div key={family.id} className="p-4 border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{family.name}</h3>
                        <p className="text-sm text-muted-foreground">{family.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{family.invite_code}</p>
                        <p className="text-xs text-muted-foreground mt-1">{family.members?.length || 0} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="card-base p-6">
              <h2 className="font-heading font-bold text-lg mb-6">Payment Transactions</h2>
              
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Session ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4 font-mono text-xs">{payment.session_id?.slice(0, 20)}...</td>
                          <td className="py-3 px-4">${payment.amount}</td>
                          <td className="py-3 px-4">{payment.plan}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'paid' ? 'bg-accent/20 text-accent' :
                              payment.status === 'pending' ? 'bg-secondary/20 text-secondary' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
