import { AccessLog } from '@/models/accessLog';
import { Creator } from '@/models/creator';
import { Password } from '@/models/password';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

interface AccessLogWithId {
  _id: Types.ObjectId;
  creatorId: {
    name: string;
    slug: string;
  };
  ipAddress: string;
  userAgent: string;
  usedAt: Date;
}

async function getAccessLogs(): Promise<AccessLogWithId[]> {
  await connectDB();

  const logs = await AccessLog.find()
    .sort({ usedAt: -1 })
    .limit(100) // Show last 100 logs
    .populate('creatorId', 'name slug')
    .lean();

  // Type assertion after validation
  return logs.map((log: any) => ({
    _id: log._id,
    creatorId: {
      name: log.creatorId?.name || 'Unknown Creator',
      slug: log.creatorId?.slug || '',
    },
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    usedAt: log.usedAt,
  }));
}

export default async function AccessLogs() {
  const logs = await getAccessLogs();

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900 mb-8'>Access Logs</h1>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Creator
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                IP Address
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                User Agent
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Access Time
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {logs.map((log) => (
              <tr key={log._id.toString()}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {log.creatorId.name}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>{log.ipAddress}</span>
                </td>
                <td className='px-6 py-4'>
                  <span className='text-sm text-gray-900 truncate block max-w-xs'>
                    {log.userAgent}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {new Date(log.usedAt).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className='px-6 py-4 text-center text-gray-500'>
                  No access logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
