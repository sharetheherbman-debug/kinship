import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, MapPin, Clock, Heart, Sparkles, ArrowRight,
  Globe, Users, Rocket, Coffee, Zap, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const openings = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Global)',
    type: 'Full-time',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote (Global)',
    type: 'Full-time',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Customer Success Lead',
    department: 'Operations',
    location: 'Remote (Global)',
    type: 'Full-time',
    gradient: 'from-rose-500 to-pink-600',
  },
];

const perks = [
  { icon: Globe, title: 'Work From Anywhere', desc: 'We\'re fully remote. Work from your favorite coffee shop, beach, or home office.' },
  { icon: Rocket, title: 'Travel Stipend', desc: '$2,000 annual travel budget. We practice what we preach!' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Full health coverage plus mental health support and gym memberships.' },
  { icon: Coffee, title: 'Unlimited PTO', desc: 'Take the time you need. We trust you to manage your own schedule.' },
  { icon: Zap, title: 'Learning Budget', desc: '$1,000/year for courses, conferences, and books to level up your skills.' },
  { icon: Users, title: 'Team Retreats', desc: 'Annual all-hands trips to incredible destinations around the world.' },
];

const values = [
  'Family first—always',
  'Build with empathy',
  'Move fast, stay humble',
  'Default to transparency',
  'Celebrate small wins',
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-teal-500/30">
              <Briefcase className="w-4 h-4" />
              Join Our Team
            </span>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Help families make
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">unforgettable memories</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              We're building the future of family travel. Join a team that values impact, creativity, and work-life balance.
            </p>
            <Button 
              onClick={() => document.getElementById('openings').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-lg px-10 py-6 rounded-2xl shadow-lg shadow-teal-500/25 font-semibold"
            >
              View Open Roles
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
                Why Kinship?
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
                More than just a job
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                We're a small, passionate team on a mission to bring families closer together through travel. Every feature we ship, every bug we fix, every email we send—it all matters.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                If you want to work somewhere your contributions are visible and celebrated, where you can grow fast, and where remote work actually works—you've found your place.
              </p>
              
              <div className="space-y-3">
                <p className="font-heading font-bold text-white">Our values:</p>
                {values.map((value, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    <span className="text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {perks.slice(0, 4).map((perk, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                  <perk.icon className="w-8 h-8 text-teal-400 mb-3" />
                  <h3 className="font-heading font-bold text-white text-sm mb-1">{perk.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* All Perks */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Perks & Benefits</h2>
            <p className="text-lg text-slate-400">We take care of our team so they can take care of our users.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <perk.icon className="w-10 h-10 text-teal-400 mb-4" />
                <h3 className="font-heading font-bold text-white mb-2">{perk.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-teal-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Open Positions
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Join the team</h2>
            <p className="text-lg text-slate-400">Find your next adventure with us.</p>
          </motion.div>

          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${job.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white text-lg group-hover:text-teal-400 transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-slate-400">{job.department}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-slate-400 mb-6">Don't see your role? We're always looking for talented people.</p>
            <Link to="/contact">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8">
                Send Us Your Resume
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
