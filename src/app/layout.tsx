import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BirdiePool — Play. Win. Give Back.',
  description: 'Turn your golf scores into prizes and charitable impact. Monthly draws, real winnings, real impact.',
  openGraph: {
    title: 'BirdiePool — Play. Win. Give Back.',
    description: 'Turn your golf scores into prizes and charitable impact.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
