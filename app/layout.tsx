import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'KeJar - Kendali Jaringan',
  description: 'Workload & Network Optimizer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} bg-slate-50 text-slate-800 h-full flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-900 antialiased`} 
      >
        {children}
      </body>
    </html>
  );
}
