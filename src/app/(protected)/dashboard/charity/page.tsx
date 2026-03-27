import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CharitySelector } from '@/components/dashboard/CharitySelector';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart } from 'lucide-react';

export default async function CharityPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles')
    .select('charity_contribution_pct, charities:selected_charity_id(id, name, logo_url, description, total_raised_cents, supporter_count)').eq('id', user.id).single();

  const selectedCharity = (profile as Record<string, unknown>)?.charities as Record<string, unknown> | null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div><h1 className="text-3xl font-black text-white">My Charity</h1><p className="text-slate-400 mt-1">Choose which charity receives a portion of your subscription</p></div>
      <CharitySelector selectedCharity={selectedCharity as never} contributionPct={(profile as Record<string, unknown>)?.charity_contribution_pct as number ?? 10} />
      {selectedCharity && (
        <Card>
          <CardContent>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" />Impact</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-emerald-400">₹{(((selectedCharity as Record<string, number>).total_raised_cents ?? 0) / 100).toFixed(0)}</p>
                <p className="text-xs text-slate-400 mt-1">Total raised by all supporters</p>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
                <p className="text-2xl font-black text-blue-400">{(selectedCharity as Record<string, number>).supporter_count ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">BirdiePool supporters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
