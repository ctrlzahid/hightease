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

    const { name, slug, bio } = await request.json();

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

    // Update creator
    const creator = await Creator.findOneAndUpdate(
      { slug: currentSlug },
      { name, slug, bio },
      { new: true }
    );

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

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
    await Promise.all(media.map((item) => deleteMedia(item.publicId)));

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
