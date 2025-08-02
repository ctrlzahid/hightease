import Link from 'next/link';
import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import connectDB from '@/lib/db';

async function getCreatorsWithStats() {
  await connectDB();

  const creators = await Creator.find().sort({ createdAt: -1 });
  const creatorIds = creators.map((c) => c._id);

  // Get media counts for each creator
  const mediaCounts = await Media.aggregate([
    { $match: { creatorId: { $in: creatorIds } } },
    { $group: { _id: '$creatorId', count: { $sum: 1 } } },
  ]);

  // Create a map of creator ID to media count
  const mediaCountMap = new Map(
    mediaCounts.map((item) => [item._id.toString(), item.count])
  );

  // Combine creator data with media counts
  return creators.map((creator) => ({
    ...creator.toObject(),
    mediaCount: mediaCountMap.get(creator._id.toString()) || 0,
  }));
}

export default async function CreatorsList() {
  const creators = await getCreatorsWithStats();

  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Creators</h1>
        <Link
          href='/admin/creators/new'
          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
        >
          Add Creator
        </Link>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Slug
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Media Count
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {creators.map((creator) => (
              <tr key={creator._id.toString()}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {creator.name}
                  </div>
                  {creator.bio && (
                    <div className='text-sm text-gray-500 truncate max-w-xs'>
                      {creator.bio}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>{creator.slug}</span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {creator.mediaCount}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {new Date(creator.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <Link
                    href={`/admin/creators/${creator.slug}/edit`}
                    className='text-blue-600 hover:text-blue-900 mr-4'
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/creators/${creator.slug}/media`}
                    className='text-green-600 hover:text-green-900'
                  >
                    Media
                  </Link>
                </td>
              </tr>
            ))}
            {creators.length === 0 && (
              <tr>
                <td colSpan={5} className='px-6 py-4 text-center text-gray-500'>
                  No creators found. Add your first creator to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
