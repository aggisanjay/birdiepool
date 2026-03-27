import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-black text-white">BirdiePool</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">Turn your golf scores into prizes and charitable impact. Play. Win. Give Back.</p>
          </div>
          {[
            { title: 'Platform', links: [{ label: 'How It Works', href: '/how-it-works' }, { label: 'Pricing', href: '/pricing' }, { label: 'Charities', href: '/charities' }, { label: 'Dashboard', href: '/dashboard' }] },
            { title: 'Legal', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }, { label: 'Cookie Policy', href: '/cookies' }] },
            { title: 'Support', links: [{ label: 'Contact Us', href: '/contact' }, { label: 'FAQ', href: '/faq' }, { label: 'Help Centre', href: '/help' }] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} BirdiePool. All rights reserved.</p>
          <p className="text-sm text-slate-500 flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 text-rose-400 inline" /> for golfers who give back</p>
        </div>
      </div>
    </footer>
  );
}
