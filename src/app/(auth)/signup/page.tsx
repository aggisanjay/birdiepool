'use client';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

import { Suspense } from 'react';

function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? 'monthly';
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (password.length < 8) throw new Error('Password must be at least 8 characters');
      const { data, error: signupError } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName, display_name: fullName.split(' ')[0] },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signupError) throw signupError;
      if (data.session) router.push(`/subscribe?plan=${plan}`);
      else router.push('/login?message=Check your email to confirm your account');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-black text-white">BirdiePool</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Join the community. Enter scores. Win prizes. Support charity.</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">{error}</p></div>}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={<ArrowRight className="w-5 h-5" />}>Create Account</Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">You&apos;ll choose your {plan} plan after signing up</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
