import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Sparkles, Send, User, Bot, Loader2, 
  MapPin, Calendar, Lightbulb, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const QUICK_PROMPTS = [
  { icon: MapPin, text: "Suggest destinations for a family trip", prompt: "Suggest 5 family-friendly travel destinations for a week-long trip with kids ages 5-12. Include reasons why each is great for families." },
  { icon: Calendar, text: "Help me plan an itinerary", prompt: "Help me plan a 7-day itinerary for a family vacation. Ask me about our destination and preferences." },
  { icon: Lightbulb, text: "Travel tips for families", prompt: "What are the top 10 travel tips for families traveling with young children?" },
];

const ADMIN_TRIGGER = 'show admin';

export default function AIAssistant() {
  const { user, family } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name}! I'm your Amarktai Network AI assistant. I can help you plan trips, suggest activities, create itineraries, and answer any travel questions. How can I help your family today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminConfig, setAdminConfig] = useState({
    openai_api_key: '',
    stripe_api_key: '',
    stripe_webhook_secret: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    app_url: '',
  });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAdminStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`);
      setAdminStats(res.data);
    } catch {
      // not superadmin – silently ignore
    }
  };

  const handleSend = async (customPrompt = null) => {
    const prompt = customPrompt || input.trim();
    if (!prompt || loading) return;

    // Hidden admin trigger
    if (prompt.toLowerCase() === ADMIN_TRIGGER) {
      setInput('');
      if (user?.is_superadmin || user?.role === 'superadmin') {
        setShowAdminPanel(true);
        loadAdminStats();
        setMessages(prev => [...prev,
          { role: 'user', content: prompt },
          { role: 'assistant', content: '🔐 **Admin Panel activated.** The configuration panel is now visible below. You can set API keys and monitor the system.' }
        ]);
      } else {
        setMessages(prev => [...prev,
          { role: 'user', content: prompt },
          { role: 'assistant', content: '🔒 Admin access is restricted to authorised administrators only.' }
        ]);
      }
      return;
    }

    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context from family info
      let context = '';
      if (family) {
        context = `User is part of the "${family.name}" family with ${family.member_details?.length || 1} members.`;
      }

      const response = await axios.post(`${API_URL}/api/ai/chat`, {
        prompt: prompt,
        context: context
      });

      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to get response. Please check your OpenAI API key configuration.';
      toast.error(errorMessage);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please make sure the OpenAI API key is configured in the backend settings, then try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setAdminSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(adminConfig).filter(([, v]) => v.trim() !== '')
      );
      await axios.post(`${API_URL}/api/admin/config`, payload);
      toast.success('Configuration saved and applied!');
      loadAdminStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-primary">Amarktai AI</h1>
                <p className="text-xs text-muted-foreground">Your family travel assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Admin Panel */}
      {showAdminPanel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full px-6 py-4"
        >
          <div className="border border-destructive/30 bg-destructive/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-destructive" />
                <h2 className="font-heading font-bold text-lg text-destructive">Admin Configuration Panel</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAdminPanel(false)}>✕ Hide</Button>
            </div>

            {/* Stats */}
            {adminStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { label: 'Users', value: adminStats.total_users },
                  { label: 'Families', value: adminStats.total_families },
                  { label: 'Transactions', value: adminStats.total_payments },
                  { label: 'Paid', value: adminStats.paid_payments },
                ].map(s => (
                  <div key={s.label} className="bg-background rounded-xl p-3 text-center">
                    <div className="font-bold text-2xl">{s.value}</div>
                    <div className="text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* System status */}
            {adminStats?.system && (
              <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(adminStats.system).map(([key, val]) => (
                  <span key={key} className={`px-3 py-1 rounded-full ${val ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                    {key.replace(/_/g, ' ')}: {val ? '✓ OK' : '✗ Not set'}
                  </span>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter values to update. Leave blank to keep existing values.
              </p>
              {[
                { key: 'openai_api_key', label: 'OpenAI API Key', placeholder: 'sk-...' },
                { key: 'stripe_api_key', label: 'Stripe API Key', placeholder: 'sk_live_...' },
                { key: 'stripe_webhook_secret', label: 'Stripe Webhook Secret', placeholder: 'whsec_...' },
                { key: 'twilio_account_sid', label: 'Twilio Account SID', placeholder: 'AC...' },
                { key: 'twilio_auth_token', label: 'Twilio Auth Token', placeholder: '...' },
                { key: 'twilio_phone_number', label: 'Twilio Phone Number', placeholder: '+1...' },
                { key: 'app_url', label: 'App URL', placeholder: 'https://yourapp.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="grid grid-cols-3 gap-3 items-center">
                  <label className="text-sm font-medium col-span-1">{label}</label>
                  <Input
                    type={['openai_api_key', 'stripe_api_key', 'stripe_webhook_secret', 'twilio_auth_token'].includes(key) ? 'password' : 'text'}
                    placeholder={placeholder}
                    value={adminConfig[key]}
                    onChange={e => setAdminConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    className="col-span-2 input-base font-mono text-sm"
                  />
                </div>
              ))}
              <Button type="submit" className="btn-primary w-full" disabled={adminSaving}>
                {adminSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                Save & Apply Configuration
              </Button>
            </form>

            <div className="pt-2 border-t border-border/40 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/superadmin-secret-access')}>
                Open Full Admin Panel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6" data-testid="ai-messages-area">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              data-testid={`ai-message-${index}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-secondary' : 'bg-primary'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-2xl px-5 py-3 ${
                  message.role === 'user' 
                    ? 'bg-secondary text-white rounded-br-none' 
                    : 'bg-white border border-border shadow-card rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-border shadow-card rounded-2xl rounded-bl-none px-5 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-6 py-4 border-t border-border/40">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => handleSend(item.prompt)}
                  disabled={loading}
                  data-testid={`quick-prompt-${index}`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border/40 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about travel planning..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 input-base"
              disabled={loading}
              data-testid="ai-input"
            />
            <Button 
              onClick={() => handleSend()} 
              className="btn-primary"
              disabled={!input.trim() || loading}
              data-testid="ai-send-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
