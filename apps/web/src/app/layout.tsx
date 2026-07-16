import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css';
import QueryProvider from '../components/providers/QueryProvider';
import { ErrorBoundary } from '../components/providers/ErrorBoundary';
import { NotificationSystem } from '../components/domain/NotificationSystem';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Stadium Stan | Operations Command Center',
  description: 'Autonomous AI-powered stadium operations platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} style={{ backgroundColor: 'var(--navy-950)', color: 'var(--graphite-100)' }}>
      <body className="min-h-full" style={{ backgroundColor: 'var(--navy-950)' }}>
        <QueryProvider>
          <ErrorBoundary name="Global App">
            {children}
            <NotificationSystem />
          </ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
