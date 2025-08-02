import { NextRequest, NextResponse } from 'next/server';
import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import { Password } from '@/models/password';
import { AccessLog } from '@/models/accessLog';
import { isValidSlug } from '@/utils/slug';
import { deleteMedia } from '@/lib/cloudinary';
import connectDB from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();
    const creator = await Creator.findOne({ slug });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: currentSlug } = await params;
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

    // Check if new slug is already taken by another creator
    if (slug !== currentSlug) {
      const existingCreator = await Creator.findOne({ slug });
      if (existingCreator) {
        return NextResponse.json(
          { error: 'Slug is already taken' },
          { status: 400 }
        );
      }
    }

    // Find existing creator to get current avatar info
    const existingCreator = await Creator.findOne({ slug: currentSlug });
    if (!existingCreator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    let avatar = existingCreator.avatar || '';
    let avatarPublicId = existingCreator.avatarPublicId || '';

    // Upload new avatar if provided
    if (avatarFile) {
      try {
        const { uploadImage, deleteMedia } = await import('@/lib/cloudinary');

        // Delete old avatar if it exists
        if (existingCreator.avatarPublicId) {
          try {
            await deleteMedia(existingCreator.avatarPublicId);
          } catch (deleteError) {
            console.error('Error deleting old avatar:', deleteError);
          }
        }

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

    // Update creator
    const creator = await Creator.findOneAndUpdate(
      { slug: currentSlug },
      {
        name,
        slug,
        bio,
        age,
        gender,
        location,
        avatar,
        avatarPublicId,
      },
      { new: true }
    );

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error updating creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    // Find creator
    const creator = await Creator.findOne({ slug });
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Delete all media from Cloudinary
    const media = await Media.find({ creatorId: creator._id });
    const cloudinaryDeletions = [];

    // Collect all Cloudinary assets to delete
    media.forEach((item) => {
      // Delete main media file if it's a cloudinary upload
      if (item.uploadType === 'cloudinary' && item.publicId) {
        cloudinaryDeletions.push(deleteMedia(item.publicId));
      }
      // Delete custom thumbnail if it exists
      if (item.customThumbnailPublicId) {
        cloudinaryDeletions.push(deleteMedia(item.customThumbnailPublicId));
      }
    });

    // Delete creator's avatar if it exists
    if (creator.avatarPublicId) {
      cloudinaryDeletions.push(deleteMedia(creator.avatarPublicId));
    }

    // Execute all Cloudinary deletions
    if (cloudinaryDeletions.length > 0) {
      try {
        await Promise.all(cloudinaryDeletions);
        console.log(
          `Successfully deleted ${cloudinaryDeletions.length} files from Cloudinary for creator: ${creator.name}`
        );
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete all related records
    await Promise.all([
      Media.deleteMany({ creatorId: creator._id }),
      Password.deleteMany({ creatorId: creator._id }),
      AccessLog.deleteMany({ creatorId: creator._id }),
      Creator.deleteOne({ _id: creator._id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
