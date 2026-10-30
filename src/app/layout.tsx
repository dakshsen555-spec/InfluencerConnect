import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InfluencerConnect — AI Micro-Influencer Marketplace for Startups',
  description: 'Connect small businesses and bootstrapped startups with authentic micro and nano-influencers using Gemini AI and RAG vector matching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
