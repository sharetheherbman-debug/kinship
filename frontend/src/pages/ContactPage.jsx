import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Mail, MapPin, Phone, MessageCircle, Clock, Send,
  ArrowRight, Globe, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'hello@amarktainetwork.com',
    subtext: 'We respond within 24 hours',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    details: 'Available in-app',
    subtext: 'Mon-Fri 9am-6pm SAST',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: MapPin,
    title: 'Office',
    details: 'Cape Town, South Africa',
    subtext: 'Remote-first company',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and follow the link we send you.' },
  { q: 'Can I use this app offline?', a: 'Yes! Core features like viewing trips and documents work offline. Changes sync when you reconnect.' },
  { q: 'How do I invite family members?', a: 'Go to your family settings and share the unique invite code. They can join from the app or website.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use bank-level encryption and never sell your data. You control all privacy settings.' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      setLoading(false);
      setSubmitted(true);
      toast.success(res.data.message || 'Message sent! We\'ll get back to you soon.');
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.detail || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-teal-500/30">
              <MessageCircle className="w-4 h-4" />
              Get In Touch
            </span>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
              We'd love to hear from you
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hello? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{info.title}</h3>
                <p className="text-teal-400 font-medium mb-1">{info.details}</p>
                <p className="text-slate-500 text-sm">{info.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold text-white mb-8">Send us a message</h2>
              
              {submitted ? (
                <div className="bg-teal-500/20 border border-teal-500/30 rounded-3xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-400">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-teal-500"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-teal-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:border-teal-500"
                      placeholder="How can we help?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-4 min-h-[150px] focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Tell us more..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white py-6 rounded-2xl font-semibold text-lg"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <h3 className="font-heading font-bold text-white mb-2">{faq.q}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl">
                <p className="text-slate-300 mb-4">Can't find what you're looking for?</p>
                <Link to="/features">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                    Browse Features
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
