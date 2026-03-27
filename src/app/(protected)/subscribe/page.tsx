'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const defaultPlan = (searchParams.get('plan') ?? 'monthly') as 'monthly' | 'yearly';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(defaultPlan);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interval: selectedPlan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) { console.error(err); setLoading(false); }
  }

  const features = ['Enter 5 Stableford scores','Monthly prize draw entry','Choose your charity','Winner verification system','Full dashboard access'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Choose Your Plan</h1>
        <p className="text-slate-400">Start entering scores and join monthly prize draws</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {([['monthly', '₹9.99', '/month', null], ['yearly', '₹89.90', '/year', 'Save 25%']] as const).map(([plan, price, period, badge]) => (
          <button key={plan} onClick={() => setSelectedPlan(plan)} className={`relative p-6 rounded-2xl border text-left transition-all ${selectedPlan === plan ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
            {badge && <div className="absolute -top-3 right-4"><span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full"><Zap className="w-3 h-3" />{badge}</span></div>}
            <p className="text-sm font-semibold text-slate-400 capitalize mb-1">{plan}</p>
            <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-white">{price}</span><span className="text-slate-400 text-sm">{period}</span></div>
          </button>
        ))}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-white mb-4">Everything included:</h3>
        <ul className="space-y-3">{features.map((f) => (<li key={f} className="flex items-center gap-3 text-slate-300"><Check className="w-5 h-5 text-emerald-400 shrink-0" />{f}</li>))}</ul>
      </div>
      <Button variant="primary" size="xl" fullWidth loading={loading} onClick={handleSubscribe}>
        Subscribe — {selectedPlan === 'yearly' ? '₹89.90/year' : '₹9.99/month'}
      </Button>
      <p className="text-center text-slate-500 text-sm mt-4">Cancel anytime. Secure payment via Stripe.</p>
    </div>
  );
}
