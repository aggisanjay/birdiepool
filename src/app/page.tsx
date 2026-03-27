import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CharitySpotlight } from '@/components/landing/CharitySpotlight';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: featuredCharities } = await supabase
    .from('charities')
    .select('id, name, slug, description, logo_url, total_raised_cents, supporter_count')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(6);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <CharitySpotlight charities={featuredCharities ?? []} />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
