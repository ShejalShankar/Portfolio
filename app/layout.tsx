import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { userData } from 'lib/data';
import { cn } from 'lib/utils';
import type { Metadata } from 'next';
import { Navbar } from './components/nav';
import { ControlBar } from './components/tambo/control-bar';
import './globals.css';
import { TamboWrapper } from './wrappers/tambo-wrapper';

export const metadata: Metadata = {
  metadataBase: new URL(userData.site),
  title: {
    default: userData.name,
    template: '%s | ' + userData.name,
  },
  description: 'Developer and Builder.',
  openGraph: {
    title: userData.name,
    description: 'Developer and Builder.',
    url: userData.site,
    siteName: userData.name,
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: userData.name,
    card: 'summary_large_image',
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
    yandex: process.env.YANDEX_VERIFICATION_CODE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        'text-black bg-white dark:text-white dark:bg-neutral-950',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-2xl mb-40 flex flex-col md:flex-row mx-4 mt-8 lg:mx-auto">
        <TamboWrapper>
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
          <ControlBar contextKey="tambo-context" />
        </TamboWrapper>
      </body>
    </html>
  );
}
