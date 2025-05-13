import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutClient from './_components/LayoutClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'AI Form Generator',
  description: 'Generate intelligent forms instantly using Google Gemini API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
