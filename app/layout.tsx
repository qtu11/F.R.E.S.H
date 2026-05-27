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
  title: {
    default: 'F.R.E.S.H Platform',
    template: '%s | F.R.E.S.H Platform',
  },
  description: 'Food Rescue – ESG – Smart Hyperlocal Platform - Giải pháp cứu trợ thực phẩm, tích hợp chỉ số ESG và phân phối hyperlocal thông minh nhằm tối ưu hóa chuỗi cung ứng thực phẩm dư thừa.',
  keywords: ['Food Rescue', 'ESG', 'Hyperlocal', 'F.R.E.S.H', 'Thực phẩm dư thừa', 'Bền vững'],
  authors: [{ name: 'F.R.E.S.H Team' }],
  metadataBase: new URL('http://localhost:3001'), // Cổng dev server đang chạy
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'F.R.E.S.H Platform',
    description: 'Food Rescue – ESG – Smart Hyperlocal Platform - Giải pháp cứu trợ và tối ưu hóa phân phối thực phẩm dư thừa thông minh kết nối thời gian thực.',
    url: 'https://freshplatform.vn',
    siteName: 'F.R.E.S.H Platform',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'F.R.E.S.H Platform',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'F.R.E.S.H Platform',
    description: 'Food Rescue – ESG – Smart Hyperlocal Platform - Giải pháp cứu trợ và tối ưu hóa phân phối thực phẩm dư thừa thông minh.',
    images: ['/banner.png'],
  },
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
