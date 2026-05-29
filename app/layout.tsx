import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'KeJar | Kendali Jaringan',
  description: 'AI-Powered Network Operations Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} dark`} style={{ height: '100%', margin: 0 }}>
      <body 
        className="bg-[#0f1115] text-slate-300 h-full flex flex-col font-sans overflow-hidden selection:bg-blue-500/30 selection:text-white antialiased" 
        style={{ margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}
