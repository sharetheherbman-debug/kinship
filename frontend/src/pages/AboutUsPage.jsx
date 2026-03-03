import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Globe, Users, Target, Sparkles, ArrowRight,
  MapPin, Calendar, Award, Rocket, Shield, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const team = [
  {
    name: 'Sarah Thompson',
    role: 'Founder & CEO',
    bio: 'Former travel blogger turned entrepreneur. Mom of three who knows the chaos of family travel firsthand.',
    avatar: 'ST',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Ex-Google engineer with a passion for building products that bring families together.',
    avatar: 'MC',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Head of Design',
    bio: 'Award-winning UX designer who believes technology should feel magical, not complicated.',
    avatar: 'ER',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    name: 'James Williams',
    role: 'Head of Growth',
    bio: 'Previously at Airbnb, passionate about helping families discover the joy of traveling together.',
    avatar: 'JW',
    gradient: 'from-rose-500 to-pink-600',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Family First',
    description: 'Every feature is designed with families in mind. We understand the unique challenges and joys of traveling together.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Privacy & Trust',
    description: 'Your data is yours. We never sell information and give you complete control over what you share.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Sparkles,
    title: 'Delightful Experience',
    description: 'Travel planning should be exciting, not stressful. We make every interaction a joy.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Families from 45+ countries use Amarktai Network. We celebrate diversity in travel styles.',
    gradient: 'from-teal-500 to-cyan-600',
  },
];

const milestones = [
  { year: '2022', title: 'The Idea', description: 'Born from a chaotic family reunion where nothing went as planned' },
  { year: '2023', title: 'First Users', description: '100 families beta test the platform and fall in love' },
  { year: '2024', title: 'Growing Fast', description: '500+ families and counting, with features they asked for' },
  { year: '2025', title: 'The Future', description: 'AI-powered planning, WebXR previews, and global expansion' },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-teal-500/30">
              <Heart className="w-4 h-4" />
              Our Story
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              We believe family time is
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">precious</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Amarktai Network was born from a simple truth: planning family trips shouldn't be harder than the trip itself. We're here to change that.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
                It started with a disaster
              </h2>
              <div className="space-y-6 text-slate-400 leading-relaxed">
                <p>
                  In 2022, our founder Sarah tried to plan a reunion for her extended family—grandparents in Cape Town, siblings in London, and cousins scattered across three continents. It was a nightmare.
                </p>
                <p>
                  Endless WhatsApp groups. Spreadsheets no one updated. Missed flights because someone had the wrong date. By the time they arrived, everyone was already exhausted.
                </p>
                <p>
                  That's when the idea for Amarktai Network was born. A single platform where families could plan together, stay connected, and actually enjoy the journey—not just the destination.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 to-violet-500/20 blur-3xl rounded-3xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="space-y-6">
                  {milestones.map((milestone, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-heading font-bold text-sm">{milestone.year}</span>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-white mb-1">{milestone.title}</h3>
                        <p className="text-slate-400 text-sm">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              What We Stand For
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white mb-3">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              The Team
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Meet the family behind Amarktai Network
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We're a small team with big hearts, united by our love of travel and family.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${member.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white font-heading font-bold text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {member.avatar}
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-1">{member.name}</h3>
                <p className="text-teal-400 text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Join our family
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start your free trial today and see why families love us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-6 rounded-2xl shadow-lg shadow-teal-500/25 font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-2xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
