import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import { Password } from '@/models/password';
import { AccessLog } from '@/models/accessLog';
import connectDB from '@/lib/db';

async function getStats() {
  await connectDB();

  const [creatorCount, mediaCount, activePasswordCount, todayAccessCount] =
    await Promise.all([
      Creator.countDocuments(),
      Media.countDocuments(),
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
    mediaCount,
    activePasswordCount,
    todayAccessCount,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-8'>
        Dashboard Overview
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Creators Card */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700'>Creators</h2>
          <p className='text-3xl font-bold text-blue-600 mt-2'>
            {stats.creatorCount}
          </p>
        </div>

        {/* Media Card */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700'>
            Total Media Items
          </h2>
          <p className='text-3xl font-bold text-green-600 mt-2'>
            {stats.mediaCount}
          </p>
        </div>

        {/* Active Passwords Card */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700'>
            Active Passwords
          </h2>
          <p className='text-3xl font-bold text-purple-600 mt-2'>
            {stats.activePasswordCount}
          </p>
        </div>

        {/* Today's Access Card */}
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-lg font-semibold text-gray-700'>
            Today's Access
          </h2>
          <p className='text-3xl font-bold text-orange-600 mt-2'>
            {stats.todayAccessCount}
          </p>
        </div>
      </div>

      <div className='mt-12'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <a
            href='/admin/creators/new'
            className='bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow'
          >
            <h3 className='text-lg font-semibold text-gray-800'>
              Add New Creator
            </h3>
            <p className='text-gray-600 mt-2'>
              Create a new creator profile and start uploading media
            </p>
          </a>

          <a
            href='/admin/passwords/new'
            className='bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow'
          >
            <h3 className='text-lg font-semibold text-gray-800'>
              Generate Password
            </h3>
            <p className='text-gray-600 mt-2'>
              Create new access passwords for creators
            </p>
          </a>

          <a
            href='/admin/logs'
            className='bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow'
          >
            <h3 className='text-lg font-semibold text-gray-800'>
              View Access Logs
            </h3>
            <p className='text-gray-600 mt-2'>
              Monitor content access and password usage
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
