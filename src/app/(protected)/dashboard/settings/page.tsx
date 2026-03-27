'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    fetch('/api/users/me').then((r) => r.json()).then((d) => setProfile(d.profile ?? {}));
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ full_name: profile.full_name, display_name: profile.display_name, phone: profile.phone }) });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Profile updated!', variant: 'success' });
    } catch { toast({ title: 'Error updating profile', variant: 'error' }); }
    finally { setLoading(false); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) { toast({ title: 'Password must be at least 8 characters', variant: 'error' }); return; }
    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast({ title: 'Password changed!', variant: 'success' });
      setCurrentPw(''); setNewPw('');
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setPwLoading(false); }
  }

  async function handleLogout() {
    await supabase.auth.signOut(); router.push('/'); router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div><h1 className="text-3xl font-black text-white">Settings</h1><p className="text-slate-400 mt-1">Manage your account preferences</p></div>
      <Card>
        <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input label="Full Name" value={profile.full_name ?? ''} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
            <Input label="Display Name" value={profile.display_name ?? ''} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} hint="Shown on your dashboard" />
            <Input label="Phone" type="tel" value={profile.phone ?? ''} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <Input label="Email" value={profile.email ?? ''} disabled hint="Email cannot be changed" />
            <Button type="submit" variant="primary" loading={loading}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="New Password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} hint="Minimum 8 characters" />
            <Button type="submit" variant="primary" loading={pwLoading}>Update Password</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
