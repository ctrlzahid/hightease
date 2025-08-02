import { NextRequest, NextResponse } from 'next/server';
import { Creator } from '@/models/creator';
import { uploadImage, deleteMedia } from '@/lib/cloudinary';
import connectDB from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }

    // Find creator
    const creator = await Creator.findOne({ slug });
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Delete old avatar if exists
    if (creator.avatarPublicId) {
      try {
        await deleteMedia(creator.avatarPublicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Continue even if deletion fails
      }
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload new avatar
    const uploadResult = await uploadImage(base64File);

    // Update creator with new avatar
    creator.avatar = uploadResult.url;
    creator.avatarPublicId = uploadResult.publicId;
    await creator.save();

    return NextResponse.json({
      avatar: creator.avatar,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
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

    // Delete avatar from Cloudinary if exists
    if (creator.avatarPublicId) {
      try {
        await deleteMedia(creator.avatarPublicId);
      } catch (error) {
        console.error('Error deleting avatar from Cloudinary:', error);
        // Continue even if deletion fails
      }
    }

    // Remove avatar from creator
    creator.avatar = undefined;
    creator.avatarPublicId = undefined;
    await creator.save();

    return NextResponse.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
