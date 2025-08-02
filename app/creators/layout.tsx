import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HighTease - Premium Content',
  description: 'Exclusive creator content',
};

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      {children}
    </div>
  );
}
