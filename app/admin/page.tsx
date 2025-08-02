import { Creator } from '@/models/creator';
import { Password } from '@/models/password';
import { AccessLog } from '@/models/accessLog';
import connectDB from '@/lib/db';
import Link from 'next/link';

async function getStats() {
  await connectDB();

  const [creatorCount, activePasswordCount, todayAccessCount] =
    await Promise.all([
      Creator.countDocuments(),
      Password.countDocuments({
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
        $and: [
          {
            $or: [{ type: 'multi-use' }, { type: 'single-use', usageCount: 0 }],
          },
        ],
      }),
      AccessLog.countDocuments({
        usedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
    ]);

  return {
    creatorCount,
    activePasswordCount,
    todayAccessCount,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12'>
        {/* Creators Card */}
        <Link href='/admin/creators' className='group block'>
          <div className='bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer'>
            <div className='text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-gray-700 transition-colors'>
                <svg
                  className='w-6 h-6 sm:w-8 sm:h-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                </svg>
              </div>
              <h2 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                Creators
              </h2>
              <p className='text-3xl sm:text-4xl font-bold text-gray-300'>
                {stats.creatorCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Active Passwords Card */}
        <Link href='/admin/passwords' className='group block'>
          <div className='bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer'>
            <div className='text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-gray-700 transition-colors'>
                <svg
                  className='w-6 h-6 sm:w-8 sm:h-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
                </svg>
              </div>
              <h2 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                Passwords
              </h2>
              <p className='text-3xl sm:text-4xl font-bold text-gray-300'>
                {stats.activePasswordCount}
              </p>
            </div>
          </div>
        </Link>

        {/* Today's Access Card */}
        <Link href='/admin/logs' className='group block'>
          <div className='bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer'>
            <div className='text-center'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-gray-700 transition-colors'>
                <svg
                  className='w-6 h-6 sm:w-8 sm:h-8 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 16H3V9h14v11z' />
                </svg>
              </div>
              <h2 className='text-lg sm:text-xl font-semibold text-white mb-2'>
                Access Logs
              </h2>
              <p className='text-3xl sm:text-4xl font-bold text-gray-300'>
                {stats.todayAccessCount}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className='mt-8 sm:mt-12'>
        <h2 className='text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto'>
          <Link
            href='/admin/creators/new'
            className='bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 group'
          >
            <div className='text-center'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-600 transition-colors'>
                <svg
                  className='w-5 h-5 sm:w-6 sm:h-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
                </svg>
              </div>
              <h3 className='text-base sm:text-lg font-semibold text-white mb-2'>
                Add Creator
              </h3>
              <p className='text-gray-300 text-sm'>
                Create new creator profile
              </p>
            </div>
          </Link>

          <Link
            href='/admin/passwords/new'
            className='bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 group'
          >
            <div className='text-center'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-600 transition-colors'>
                <svg
                  className='w-5 h-5 sm:w-6 sm:h-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z' />
                </svg>
              </div>
              <h3 className='text-base sm:text-lg font-semibold text-white mb-2'>
                New Password
              </h3>
              <p className='text-gray-300 text-sm'>Generate access password</p>
            </div>
          </Link>

          <Link
            href='/admin/logs'
            className='bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 group'
          >
            <div className='text-center'>
              <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-600 transition-colors'>
                <svg
                  className='w-5 h-5 sm:w-6 sm:h-6 text-white'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' />
                </svg>
              </div>
              <h3 className='text-base sm:text-lg font-semibold text-white mb-2'>
                View Logs
              </h3>
              <p className='text-gray-300 text-sm'>Monitor access activity</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
