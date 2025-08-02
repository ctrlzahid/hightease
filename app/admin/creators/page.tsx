import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import connectDB from '@/lib/db';
import CreatorsTable from './components/CreatorsTable';

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
  return creators.map((creator) => {
    const creatorObj = creator.toObject();
    // Ensure all ObjectIds and Dates are properly serialized
    const serializedCreator = {
      _id: creatorObj._id ? creatorObj._id.toString() : '',
      name: String(creatorObj.name || ''),
      slug: String(creatorObj.slug || ''),
      bio: String(creatorObj.bio || ''),
      age: creatorObj.age ? Number(creatorObj.age) : null,
      gender: creatorObj.gender ? String(creatorObj.gender) : null,
      location: String(creatorObj.location || ''),
      avatar: creatorObj.avatar ? String(creatorObj.avatar) : undefined,
      avatarPublicId: creatorObj.avatarPublicId
        ? String(creatorObj.avatarPublicId)
        : null,
      createdAt: creatorObj.createdAt
        ? new Date(creatorObj.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: creatorObj.updatedAt
        ? new Date(creatorObj.updatedAt).toISOString()
        : new Date().toISOString(),
      mediaCount: Number(mediaCountMap.get(creator._id.toString()) || 0),
    };
    return serializedCreator;
  });
}

export default async function CreatorsList() {
  const creators = await getCreatorsWithStats();

  return <CreatorsTable creators={creators} />;
}
