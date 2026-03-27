import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { NumberBall } from '@/components/shared/NumberBall';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-24">
        <div className="text-center py-16 px-6">
          <h1 className="text-5xl font-black text-white mb-4">How BirdiePool Works</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to know about scoring, draws, prizes, and giving back.</p>
        </div>
        <HowItWorks />

        {/* Score explanation */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-black text-white mb-8 text-center">Your Scores = Your Numbers</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-300 mb-6 leading-relaxed">Your 5 most recent Stableford scores become your unique "lottery numbers" for the monthly draw. You don't need to pick numbers — your golf performance IS your entry.</p>
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <p className="text-sm text-slate-400 mb-3">Example: Your last 5 scores</p>
              <div className="flex gap-3 flex-wrap">
                {[36, 42, 28, 35, 39].map(( n: any, i: number ) => <NumberBall key={i} number={n} matched={true} size="lg" delay={i * 0.1} />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[['Match 3 numbers', '3-Number Match', 'Win a share of 25% of the prize pool'], ['Match 4 numbers', '4-Number Match', 'Win a share of 35% of the prize pool'], ['Match all 5', 'Jackpot!', 'Win a share of 40% + any rollover']].map(([badge, title, desc]) => (
                <div key={title} className="bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{badge}</p>
                  <p className="font-bold text-white mb-1">{title}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <h2 className="text-3xl font-black text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              ['When is the draw?', 'Draws happen on the 28th of each month (or the closest business day).'],
              ['What if no one wins the jackpot?', 'The jackpot rolls over to the next month, growing until someone wins all 5 numbers.'],
              ['How do I claim a prize?', 'Winners are notified by email. Upload a screenshot of your scores from your golf app or club system, and our team will verify and arrange payment.'],
              ['Can I change my charity?', 'Yes! You can update your charity selection any time from your dashboard.'],
              ['What Stableford scoring is used?', 'Any valid Stableford score between 1 and 45 points. These are your draw numbers.'],
              ['What happens if I cancel my subscription?', 'You retain access until the end of your billing period. After that you\'re no longer eligible for draws.'],
            ].map(([q, a]) => (
              <div key={q} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
