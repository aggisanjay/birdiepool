import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-24">
        <div className="text-center py-16 px-6">
          <h1 className="text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto">One plan. Full access. Choose monthly or yearly and start playing.</p>
        </div>
        <PricingSection />
        <section className="max-w-3xl mx-auto px-6 py-8 pb-24">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Where does your money go?</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="space-y-4">
              {[['50%', 'Prize Pool', 'Goes into the monthly draw — split between 3, 4, and 5-number match winners', 'bg-emerald-500'], ['≥10%', 'Your Charity', 'Donated to your chosen charity every month (you choose the percentage)', 'bg-rose-500'], ['~40%', 'Platform', 'Covers technology, processing fees, and keeping BirdiePool running', 'bg-slate-500']].map(([pct, label, desc, color]) => (
                <div key={label} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${color}/20 flex items-center justify-center shrink-0`}><span className={`text-sm font-black ${color.replace('bg-', 'text-').replace('/20', '-400')}`}>{pct}</span></div>
                  <div><p className="font-bold text-white">{label}</p><p className="text-sm text-slate-400">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}
