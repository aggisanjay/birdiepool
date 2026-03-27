'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

interface CharityFormProps { charity?: Record<string, unknown>; mode: 'create' | 'edit'; }

export function CharityForm({ charity, mode }: CharityFormProps) {
  const [form, setForm] = useState({
    name: (charity?.name as string) ?? '',
    slug: (charity?.slug as string) ?? '',
    description: (charity?.description as string) ?? '',
    long_description: (charity?.long_description as string) ?? '',
    website_url: (charity?.website_url as string) ?? '',
    contact_email: (charity?.contact_email as string) ?? '',
    category: (charity?.category as string) ?? '',
    is_featured: (charity?.is_featured as boolean) ?? false,
    is_active: (charity?.is_active as boolean) ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') setForm((prev) => ({ ...prev, slug: value.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const url = mode === 'create' ? '/api/charities' : `/api/charities/${charity?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: mode === 'create' ? 'Charity created!' : 'Charity updated!', variant: 'success' });
      router.push('/admin/charities');
    } catch (err: unknown) { toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown error', variant: 'error' }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Charity Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
        <Input label="URL Slug" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} required hint="Used in URLs e.g. /charities/my-charity" />
        <Input label="Category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} />
        <Input label="Website URL" type="url" value={form.website_url} onChange={(e) => handleChange('website_url', e.target.value)} />
        <Input label="Contact Email" type="email" value={form.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Short Description</label>
        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={2}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Description</label>
        <textarea value={form.long_description} onChange={(e) => handleChange('long_description', e.target.value)} rows={5}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
      </div>
      <div className="flex gap-6">
        {[['is_featured', 'Featured on homepage'], ['is_active', 'Active (visible to users)']].map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => handleChange(key, e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800" />
            <span className="text-sm text-slate-300">{label}</span>
          </label>
        ))}
      </div>
      <Button type="submit" variant="primary" size="lg" loading={loading}>{mode === 'create' ? 'Create Charity' : 'Save Changes'}</Button>
    </form>
  );
}
