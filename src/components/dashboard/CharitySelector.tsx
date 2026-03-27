'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Search, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';

interface Charity { id: string; name: string; logo_url: string | null; description: string | null; }
interface CharitySelectorProps { selectedCharity: Charity | null; contributionPct: number; }

export function CharitySelector({ selectedCharity, contributionPct: initialPct }: CharitySelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [contributionPct, setContributionPct] = useState(initialPct);
  const [savingPct, setSavingPct] = useState(false);
  const { toast } = useToast();

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(); if (search) params.set('search', search);
      const res = await fetch(`/api/charities?${params}`);
      const data = await res.json();
      setCharities(data.charities ?? []);
    } catch { console.error('Failed to load charities'); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { if (showPicker) fetchCharities(); }, [showPicker, fetchCharities]);

  async function selectCharity(charityId: string) {
    try {
      const res = await fetch('/api/users/me/charity', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ charity_id: charityId, contribution_pct: contributionPct }) });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Charity updated!', variant: 'success' }); setShowPicker(false); window.location.reload();
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
  }

  async function updateContributionPct() {
    if (contributionPct < 10 || contributionPct > 100) { toast({ title: 'Invalid percentage', description: 'Must be between 10% and 100%', variant: 'error' }); return; }
    setSavingPct(true);
    try {
      const res = await fetch('/api/users/me/charity', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ charity_id: selectedCharity?.id, contribution_pct: contributionPct }) });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Contribution updated!', variant: 'success' });
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setSavingPct(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400" />Your Charity</CardTitle><CardDescription>{selectedCharity ? `${contributionPct}% of your subscription supports this charity` : 'Select a charity to support'}</CardDescription></CardHeader>
      <CardContent>
        {selectedCharity ? (
          <div>
            <div className="flex items-center gap-4 bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 mb-4">
              {selectedCharity.logo_url && <Image src={selectedCharity.logo_url} alt={selectedCharity.name} width={48} height={48} className="rounded-lg object-cover" />}
              <div className="flex-1"><h4 className="font-bold text-white">{selectedCharity.name}</h4><p className="text-xs text-slate-400 line-clamp-2">{selectedCharity.description}</p></div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Contribution: <span className="text-emerald-400 font-bold">{contributionPct}%</span></label>
              <input type="range" min={10} max={100} step={5} value={contributionPct} onChange={(e) => setContributionPct(parseInt(e.target.value))} className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>10% (min)</span><span>100%</span></div>
              {contributionPct !== initialPct && <Button size="sm" variant="primary" onClick={updateContributionPct} loading={savingPct} className="mt-2" fullWidth>Save {contributionPct}%</Button>}
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowPicker(true)} icon={<ChevronRight className="w-4 h-4" />}>Change Charity</Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <Heart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">Choose a charity to receive a portion of your subscription</p>
            <Button variant="primary" size="md" onClick={() => setShowPicker(true)} icon={<Heart className="w-4 h-4" />}>Pick a Charity</Button>
          </div>
        )}
        {showPicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white mb-3">Select a Charity</h3>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search charities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </div>
              <div className="overflow-y-auto max-h-96 p-4 space-y-2">
                {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> : charities.length === 0 ? <div className="text-center py-8 text-slate-400">No charities found</div> : charities.map((charity) => (
                  <button key={charity.id} onClick={() => selectCharity(charity.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left">
                    {charity.logo_url && <Image src={charity.logo_url} alt={charity.name} width={40} height={40} className="rounded-lg object-cover" />}
                    <div className="flex-1"><p className="font-semibold text-white">{charity.name}</p><p className="text-xs text-slate-400 line-clamp-1">{charity.description}</p></div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-slate-800"><Button variant="ghost" size="sm" fullWidth onClick={() => setShowPicker(false)}>Cancel</Button></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
