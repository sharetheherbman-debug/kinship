import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';
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

  const navBackground = scrolled || !isLanding
    ? 'bg-slate-900/70 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10'
    : 'bg-transparent backdrop-blur-sm';

  const textColor = 'text-white';
  const logoColor = 'text-white';

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              scrolled || !isLanding 
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50' 
                : 'bg-white/15 backdrop-blur-sm border border-white/20 group-hover:bg-white/25'
            }`}>
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className={`font-heading font-bold text-xl transition-colors ${logoColor}`}>
              Kinship Journeys
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`font-medium transition-all hover:text-teal-400 ${textColor} ${
                  location.pathname === link.path ? 'text-teal-400' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button 
                variant="ghost" 
                className={`${textColor} hover:bg-white/10 rounded-full px-5 font-medium`}
                data-testid="login-btn"
              >
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 rounded-full px-6 transition-all duration-300 hover:scale-105 font-semibold" 
                data-testid="get-started-btn"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 py-6 px-6">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`block py-3 font-medium text-lg transition-colors ${
                    location.pathname === link.path ? 'text-teal-400' : 'text-white hover:text-teal-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-6 mt-4 border-t border-white/10 space-y-3">
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white/10">
                  Log In
                </Button>
              </Link>
              <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full font-semibold">
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
