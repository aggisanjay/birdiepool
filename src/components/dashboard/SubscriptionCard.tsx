'use client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

interface SubscriptionCardProps { subscription: Record<string, unknown> | null; isActive: boolean; }

export function SubscriptionCard({ subscription, isActive }: SubscriptionCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel? You'll keep access until the end of your billing period.")) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to cancel');
      toast({ title: 'Subscription cancelled', description: "You'll retain access until the end of your billing period.", variant: 'success' });
      window.location.reload();
    } catch { toast({ title: 'Error', description: 'Failed to cancel subscription', variant: 'error' }); }
    finally { setCancelling(false); }
  }

  if (!subscription || !isActive) {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-900">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
            <div className="flex-1"><h3 className="font-bold text-white">No Active Subscription</h3><p className="text-sm text-slate-400">Subscribe to enter scores and join monthly draws</p></div>
            <Link href="/subscribe"><Button variant="primary" size="md">Subscribe Now</Button></Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renewalDate = new Date(subscription.current_period_end as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><CreditCard className="w-6 h-6 text-emerald-500" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{subscription.interval === 'yearly' ? 'Yearly' : 'Monthly'} Plan</h3>
                <Badge variant={isActive ? 'success' : 'warning'}>{subscription.status as string}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {subscription.cancel_at ? <span className="text-amber-400">Cancels on {new Date(subscription.cancel_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span> : <span>Renews {renewalDate}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">₹{((subscription.amount_cents as number) / 100).toFixed(2)}</span>
            <span className="text-sm text-slate-400">/{subscription.interval === 'yearly' ? 'year' : 'month'}</span>
            {!subscription.cancel_at && <Button variant="ghost" size="sm" onClick={handleCancel} loading={cancelling} className="text-slate-400 hover:text-red-400">Cancel</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
