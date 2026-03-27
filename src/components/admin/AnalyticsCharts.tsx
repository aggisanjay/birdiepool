'use client';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { BarChart2, TrendingUp, Users, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface AnalyticsChartsProps {
  signupsByMonth: Record<string, number>;
  revenue: { prizePool: number; charity: number; platform: number };
  drawHistory: Record<string, unknown>[] | null;
  scoreFrequency: Record<number, number>;
  topCharities: Record<string, unknown>[] | null;
  recentWinners: Record<string, unknown>[] | null;
}

export function AnalyticsCharts({ signupsByMonth, revenue, drawHistory, topCharities, recentWinners }: AnalyticsChartsProps) {
  const months = Object.entries(signupsByMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxSignups = Math.max(...months.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Revenue split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Prize Pool', value: revenue.prizePool, icon: BarChart2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Charity Contributions', value: revenue.charity, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Platform Revenue', value: revenue.platform, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((item) => (
          <Card key={item.label} padding="md">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
            <p className={`text-2xl font-black ${item.color}`}><AnimatedCounter value={item.value / 100} prefix="₹" decimals={0} /></p>
            <p className="text-sm text-slate-400">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Signups bar chart */}
      {months.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" />New Subscriptions (last 6 months)</h3>
          <div className="flex items-end gap-2 h-32">
            {months.map(([month, count]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400 font-bold">{count}</span>
                <div className="w-full bg-blue-500/80 rounded-t-lg transition-all" style={{ height: `${(count / maxSignups) * 100}%`, minHeight: '4px' }} />
                <span className="text-xs text-slate-500">{month.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Draw history */}
      {drawHistory && drawHistory.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Recent Draw History</h3>
          <div className="space-y-2">
            {drawHistory.slice(0, 6).map((draw) => (
              <div key={draw.id as string} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div><p className="font-medium text-white text-sm">{new Date(draw.draw_month as string).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-slate-400">{draw.eligible_participants as number} participants</p></div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">₹{((draw.total_pool_cents as number) / 100).toFixed(0)}</p>
                  <p className="text-xs text-slate-400">{draw.match_5_count as number} jackpot winner{(draw.match_5_count as number) !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top charities */}
      {topCharities && topCharities.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400" />Top Charities by Amount Raised</h3>
          <div className="space-y-3">
            {topCharities.slice(0, 5).map((charity, i) => {
              const max = (topCharities[0].total_raised_cents as number) || 1;
              const pct = ((charity.total_raised_cents as number) / max) * 100;
              return (
                <div key={charity.id as string} className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-white font-medium">{i + 1}. {charity.name as string}</span><span className="text-emerald-400">₹{((charity.total_raised_cents as number) / 100).toFixed(0)}</span></div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent winners */}
      {recentWinners && recentWinners.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Recent Winners</h3>
          <div className="space-y-2">
            {recentWinners.slice(0, 8).map((w) => {
              const profile = w.profiles as Record<string, string>;
              const draw = w.draws as Record<string, unknown>;
              return (
                <div key={w.id as string} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                  <div><p className="font-medium text-white">{profile.full_name}</p><p className="text-xs text-slate-400">{new Date(draw.draw_month as string).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p></div>
                  <div className="text-right"><p className="text-emerald-400 font-bold">₹{((w.prize_amount_cents as number) / 100).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{w.payment_status as string}</span></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
