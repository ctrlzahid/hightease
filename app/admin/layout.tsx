import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AdminNav from './components/AdminNav';
import AdminCheck from './components/AdminCheck';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard - HighTease',
  description: 'Manage creators and content',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen dark bg-black ${inter.className}`}>
      <AdminCheck />
      <AdminNav />
      <main className='container mx-auto px-4 py-8'>{children}</main>
    </div>
  );
}
