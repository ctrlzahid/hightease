import Link from 'next/link';

export default function AdminNav() {
  return (
    <nav className='bg-[#1a1a1a] shadow-md'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <Link href='/admin' className='text-white font-semibold text-lg'>
              HighTease Admin
            </Link>
          </div>

          <div className='flex space-x-4'>
            <Link
              href='/admin/creators'
              className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
            >
              Content
            </Link>
            <Link
              href='/admin/passwords'
              className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
            >
              Passwords
            </Link>
            <Link
              href='/admin/logs'
              className='text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
            >
              Access Logs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
