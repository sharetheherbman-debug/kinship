import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ArrowLeft, Sparkles, Send, User, Bot, Loader2, 
  MapPin, Calendar, Lightbulb
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

export default function AIAssistant() {
  const { user, family } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name}! I'm your Kinship AI assistant. I can help you plan trips, suggest activities, create itineraries, and answer any travel questions. How can I help your family today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (customPrompt = null) => {
    const prompt = customPrompt || input.trim();
    if (!prompt || loading) return;

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
                <h1 className="font-heading font-bold text-primary">Kinship AI</h1>
                <p className="text-xs text-muted-foreground">Your family travel assistant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
