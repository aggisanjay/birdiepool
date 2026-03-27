'use client';
import { motion } from 'framer-motion';
import { UserPlus, Target, Gift, Heart } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Subscribe', description: 'Join for ₹9.99/month. Pick a charity you care about. A portion of your subscription goes directly to them.', color: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20' },
  { icon: Target, title: 'Enter Your Scores', description: 'Log your last 5 Stableford scores. They become your unique draw numbers — no extra tickets needed.', color: 'from-emerald-500 to-green-500', shadowColor: 'shadow-emerald-500/20' },
  { icon: Gift, title: 'Monthly Draw', description: 'Every month, 5 numbers are drawn. Match 3, 4, or all 5 to win from the prize pool. Jackpots roll over!', color: 'from-amber-500 to-orange-500', shadowColor: 'shadow-amber-500/20' },
  { icon: Heart, title: 'Make an Impact', description: 'Win or not, your subscription supports a real charity every single month. Golf with purpose.', color: 'from-rose-500 to-pink-500', shadowColor: 'shadow-rose-500/20' },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How It Works</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Four simple steps to turn your golf game into something meaningful</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }}>
              <div className="relative group">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 z-10">{index + 1}</div>
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-slate-700">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg ${step.shadowColor}`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
