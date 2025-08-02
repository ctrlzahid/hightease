import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Media } from '@/models/media';
import { deleteMedia } from '@/lib/cloudinary';
import connectDB from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    // Find the media item
    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary only if it's a cloudinary upload
    if (media.uploadType === 'cloudinary' && media.publicId) {
      try {
        await deleteMedia(media.publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
