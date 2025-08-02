import { NextRequest, NextResponse } from 'next/server';
import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import { isValidSlug } from '@/utils/slug';
import connectDB from '@/lib/db';

export async function GET() {
  try {
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
    const creatorsWithStats = creators.map((creator) => ({
      ...creator.toObject(),
      mediaCount: mediaCountMap.get(creator._id.toString()) || 0,
    }));

    return NextResponse.json(creatorsWithStats);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const bio = formData.get('bio') as string;
    const ageParam = formData.get('age') as string;
    const age = ageParam ? parseInt(ageParam) : undefined;
    const gender = formData.get('gender') as 'male' | 'female' | 'other';
    const location = formData.get('location') as string;
    const avatarFile = formData.get('avatar') as File | null;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingCreator = await Creator.findOne({ slug });
    if (existingCreator) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 400 }
      );
    }

    let avatar = '';
    let avatarPublicId = '';

    // Upload avatar if provided
    if (avatarFile) {
      try {
        const { uploadImage } = await import('@/lib/cloudinary');
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert buffer to base64 string for Cloudinary
        const base64String = `data:${avatarFile.type};base64,${buffer.toString(
          'base64'
        )}`;

        const uploadResult = await uploadImage(base64String, {
          folder: 'creator-content/avatars',
          transformation: [
            {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face',
            },
          ],
        });

        avatar = uploadResult.url;
        avatarPublicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload avatar' },
          { status: 500 }
        );
      }
    }

    // Create new creator
    const creator = await Creator.create({
      name,
      slug,
      bio: bio || '',
      age,
      gender,
      location: location || '',
      avatar,
      avatarPublicId,
    });

    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error('Error creating creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
