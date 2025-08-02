import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6'>HighTease</h1>
          <p className='text-xl text-gray-300 mb-8'>
            Access premium content with secure, password-protected galleries.
          </p>
          <div className='flex flex-col md:flex-row gap-4 justify-center'>
            <Link
              href='/admin/login'
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 transition-colors'
            >
              Admin Login
            </Link>
            <Link
              href='/creators'
              className='inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors'
            >
              Browse Content
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className='mt-24 grid md:grid-cols-3 gap-8'>
          <div className='bg-gray-900 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold mb-3'>Secure Access</h3>
            <p className='text-gray-400'>
              Password-protected content ensures your media is only accessible
              to authorized viewers.
            </p>
          </div>
          <div className='bg-gray-900 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold mb-3'>High Quality Media</h3>
            <p className='text-gray-400'>
              Stream and view high-resolution images and videos with optimal
              performance.
            </p>
          </div>
          <div className='bg-gray-900 p-6 rounded-lg'>
            <h3 className='text-xl font-semibold mb-3'>Mobile Optimized</h3>
            <p className='text-gray-400'>
              Enjoy a seamless viewing experience across all your devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
