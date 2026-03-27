'use client';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      router.push(redirect); router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-black text-white">BirdiePool</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          {message && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5"><p className="text-emerald-400 text-sm">{message}</p></div>}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">{error}</p></div>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<ArrowRight className="w-5 h-5" />}>Sign In</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
