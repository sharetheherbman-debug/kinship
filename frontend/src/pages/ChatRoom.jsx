import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  ArrowLeft, MessageCircle, Send, Users, Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SOCKET_PATH = '/api/socket.io';

export default function ChatRoom() {
  const { user, family } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!family) return;

    // Fetch existing messages
    fetchMessages();

    // Initialize Socket.IO connection
    socketRef.current = io(API_URL, { 
      path: SOCKET_PATH,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Join family room
      socketRef.current.emit('join_room', { room_id: family.id });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketRef.current.on('room_joined', (data) => {
      console.log('Joined room:', data.room_id);
    });

    socketRef.current.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('user_typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.user_name)) {
          return [...prev, data.user_name];
        }
        return prev;
      });
      
      // Remove typing indicator after 2 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(name => name !== data.user_name));
      }, 2000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { room_id: family.id });
        socketRef.current.disconnect();
      }
    };
  }, [family]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${family.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API_URL}/api/chat/send`, {
        family_id: family.id,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { 
        room_id: family.id, 
        user_name: user.name 
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-heading font-bold text-primary">{family?.name} Chat</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {family?.member_details?.length || 0} members
                    {connected && <span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6" data-testid="chat-messages-area">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="font-heading text-xl font-bold text-primary mb-2">Start the Conversation</h2>
              <p className="text-muted-foreground">Be the first to send a message to your family!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex items-center justify-center mb-4">
                  <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {date}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.user_id === user.id;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                        data-testid={`chat-message-${index}`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={isOwnMessage ? 'bg-secondary text-white' : 'bg-primary text-white'}>
                            {message.user_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                          {!isOwnMessage && (
                            <span className="text-xs text-muted-foreground mb-1 block">
                              {message.user_name}
                            </span>
                          )}
                          <div className={`inline-block rounded-2xl px-4 py-2 ${
                            isOwnMessage 
                              ? 'bg-secondary text-white rounded-br-none' 
                              : 'bg-muted rounded-bl-none'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/40 px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              className="flex-1 input-base"
              data-testid="chat-input"
            />
            <Button 
              type="submit" 
              className="btn-primary"
              disabled={!newMessage.trim()}
              data-testid="send-message-btn"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
