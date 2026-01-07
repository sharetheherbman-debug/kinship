import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLanding ? 'bg-transparent' : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isLanding 
                ? 'bg-white/20 backdrop-blur-sm' 
                : 'bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/20'
            }`}>
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className={`font-heading font-bold text-xl transition-colors ${
              isLanding ? 'text-white' : 'text-slate-900'
            }`}>Kinship Journeys</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className={`font-medium transition-colors ${
              isLanding ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Features</Link>
            <Link to="/pricing" className={`font-medium transition-colors ${
              isLanding ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className={isLanding ? 'text-white hover:bg-white/10' : ''} data-testid="login-btn">
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 rounded-full px-6" data-testid="get-started-btn">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className={isLanding ? 'text-white' : 'text-slate-900'} />
            ) : (
              <Menu className={isLanding ? 'text-white' : 'text-slate-900'} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-6 space-y-4 ${isLanding ? 'text-white' : ''}`}>
            <Link to="/features" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link to="/pricing" className="block py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
            <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
