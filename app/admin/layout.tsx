import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AdminCheck from './components/AdminCheck';
import AdminHeader from './components/AdminHeader';

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
    <div className={`min-h-screen text-white ${inter.className}`}>
      <AdminCheck />
      <AdminHeader />
      <main className='container mx-auto px-2 sm:px-4 py-4 sm:py-6'>
        {children}
      </main>
    </div>
  );
}
