import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navBackground = scrolled || !isLanding
    ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5'
    : 'bg-white/10 backdrop-blur-md border-b border-white/10';

  const textColor = scrolled || !isLanding ? 'text-slate-800' : 'text-white';
  const logoColor = scrolled || !isLanding ? 'text-slate-900' : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              scrolled || !isLanding 
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50' 
                : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
            }`}>
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className={`font-heading font-bold text-xl transition-colors ${logoColor}`}>
              Kinship Journeys
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className={`font-medium transition-all hover:opacity-80 ${textColor}`}>
              Features
            </Link>
            <Link to="/pricing" className={`font-medium transition-all hover:opacity-80 ${textColor}`}>
              Pricing
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                className={`${textColor} hover:bg-white/10 rounded-full px-5`}
                data-testid="login-btn"
              >
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 rounded-full px-6 transition-all duration-300 hover:scale-105" 
                data-testid="get-started-btn"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden p-2 rounded-xl transition-colors ${
              scrolled || !isLanding ? 'hover:bg-slate-100' : 'hover:bg-white/10'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className={scrolled || !isLanding ? 'text-slate-900' : 'text-white'} />
            ) : (
              <Menu className={scrolled || !isLanding ? 'text-slate-900' : 'text-white'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-6 space-y-4 ${scrolled || !isLanding ? 'text-slate-800' : 'text-white'}`}>
            <Link to="/features" className="block py-2 font-medium hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link to="/pricing" className="block py-2 font-medium hover:opacity-80" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <div className="pt-4 space-y-3">
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Log In
                </Button>
              </Link>
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
