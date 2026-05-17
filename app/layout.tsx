import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { FloatingAIAssistant } from '@/components/FloatingAIAssistant';
import { ScrollToTop } from '@/components/ScrollToTop';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

import { Providers } from '@/app/providers';
import { GlobalSettings } from '@/components/GlobalSettings';

export const metadata: Metadata = {
  title: 'F.R.E.S.H Platform',
  description: 'Food Rescue – ESG – Smart Hyperlocal Platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-sans">
        <Providers>
          {children}
          <FloatingAIAssistant />
          <GlobalSettings />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
