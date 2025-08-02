import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import Link from 'next/link';
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
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Our Creators</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {creators.map((creator) => (
          <Link
            key={creator._id.toString()}
            href={`/creators/${creator.slug}`}
            className='bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors'
          >
            <h2 className='text-xl font-semibold mb-2'>{creator.name}</h2>
            {creator.bio && (
              <p className='text-gray-400 mb-4 line-clamp-2'>{creator.bio}</p>
            )}
            <div className='text-sm text-gray-500'>
              {creator.mediaCount} items
            </div>
          </Link>
        ))}
        {creators.length === 0 && (
          <div className='col-span-3 text-center text-gray-500 py-12'>
            No creators available yet.
          </div>
        )}
      </div>
    </div>
  );
}
