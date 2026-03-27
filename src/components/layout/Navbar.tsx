'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Sparkles, Menu, X } from 'lucide-react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  const navLinks = [{ label: 'How It Works', href: '/how-it-works' }, { label: 'Charities', href: '/charities' }, { label: 'Pricing', href: '/pricing' }];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-emerald-400" />
          <span className="text-xl font-black text-white">BirdiePool</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(( link: any ) => <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{link.label}</Link>)}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard"><Button variant="primary" size="md">Dashboard</Button></Link>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="md">Sign In</Button></Link>
              <Link href="/signup"><Button variant="primary" size="md">Get Started</Button></Link>
            </>
          )}
        </div>
        <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800">
            <div className="px-6 py-6 space-y-4">
              {navLinks.map(( link: any ) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-lg font-medium text-slate-300 hover:text-white">{link.label}</Link>)}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}><Button variant="primary" size="lg" fullWidth>Dashboard</Button></Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" size="lg" fullWidth>Sign In</Button></Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}><Button variant="primary" size="lg" fullWidth>Get Started</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
