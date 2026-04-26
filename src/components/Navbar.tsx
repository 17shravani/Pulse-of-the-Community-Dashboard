import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Live Map' },
  { to: '/rescue', label: 'Animal Rescue' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl">
          <div className="w-8 h-8 rounded-lg civic-gradient flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="civic-gradient-text">CivicPulse</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {active && <motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/report" className="civic-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            + Report
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right text-xs">
                <p className="font-semibold">{profile?.display_name ?? 'You'}</p>
                <p className="text-muted-foreground">Trust {profile?.trust_score ?? 50}</p>
              </div>
              <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-muted" title="Sign out"><LogOut className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => nav('/auth')} className="px-3 py-2 rounded-lg border border-border text-sm font-semibold inline-flex items-center gap-1">
              <UserIcon className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border">
            <div className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${location.pathname === item.to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                  {item.label}
                </Link>
              ))}
              <Link to="/report" onClick={() => setOpen(false)} className="block px-4 py-2 rounded-lg civic-gradient text-primary-foreground text-sm font-semibold text-center">+ Report Issue</Link>
              {user ? (
                <button onClick={() => { setOpen(false); signOut(); }} className="w-full px-4 py-2 rounded-lg bg-muted text-sm font-medium">Sign out</button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="block px-4 py-2 rounded-lg border border-border text-sm font-semibold text-center">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
