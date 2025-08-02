import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Media } from '@/models/media';
import { uploadImage, deleteMedia } from '@/lib/cloudinary';
import { parseVideoUrl, getVideoThumbnail } from '@/utils/video';
import connectDB from '@/lib/db';

// Upload custom thumbnail
export async function POST(
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

    const formData = await request.formData();
    const file = formData.get('thumbnail') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No thumbnail file provided' },
        { status: 400 }
      );
    }

    // Delete old custom thumbnail if exists
    if (media.customThumbnailPublicId) {
      try {
        await deleteMedia(media.customThumbnailPublicId);
      } catch (error) {
        console.error('Error deleting old thumbnail:', error);
        // Continue even if deletion fails
      }
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload thumbnail (smaller size for better performance)
    const uploadResult = await uploadImage(base64File, {
      transformation: [
        { width: 640, height: 360, crop: 'fill', quality: 'auto:good' },
      ],
    });

    // Update media with new custom thumbnail
    media.customThumbnail = uploadResult.url;
    media.customThumbnailPublicId = uploadResult.publicId;
    media.hasCustomThumbnail = true;
    await media.save();

    return NextResponse.json({
      customThumbnail: media.customThumbnail,
      message: 'Thumbnail uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate thumbnail for YouTube/Vimeo videos
export async function PUT(
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

    if (media.type !== 'video') {
      return NextResponse.json(
        { error: 'Thumbnail generation only available for videos' },
        { status: 400 }
      );
    }

    if (!['youtube', 'vimeo'].includes(media.uploadType)) {
      return NextResponse.json(
        {
          error: 'Auto-generation only available for YouTube and Vimeo videos',
        },
        { status: 400 }
      );
    }

    // Parse video URL to get thumbnail
    const videoInfo = parseVideoUrl(media.url);
    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Could not parse video URL' },
        { status: 400 }
      );
    }

    let thumbnailUrl = null;

    if (videoInfo.type === 'youtube') {
      thumbnailUrl = videoInfo.thumbnail;
    } else if (videoInfo.type === 'vimeo') {
      thumbnailUrl = await getVideoThumbnail(videoInfo);
    }

    if (!thumbnailUrl) {
      return NextResponse.json(
        { error: 'Could not generate thumbnail for this video' },
        { status: 400 }
      );
    }

    // Download the thumbnail and upload to Cloudinary
    const response = await fetch(thumbnailUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch original thumbnail');
    }

    const buffer = await response.arrayBuffer();
    const base64File = `data:image/jpeg;base64,${Buffer.from(buffer).toString(
      'base64'
    )}`;

    // Delete old custom thumbnail if exists
    if (media.customThumbnailPublicId) {
      try {
        await deleteMedia(media.customThumbnailPublicId);
      } catch (error) {
        console.error('Error deleting old thumbnail:', error);
      }
    }

    // Upload to Cloudinary with optimization
    const uploadResult = await uploadImage(base64File, {
      transformation: [
        { width: 640, height: 360, crop: 'fill', quality: 'auto:good' },
      ],
    });

    // Update media with generated thumbnail
    media.customThumbnail = uploadResult.url;
    media.customThumbnailPublicId = uploadResult.publicId;
    media.hasCustomThumbnail = true;
    await media.save();

    return NextResponse.json({
      customThumbnail: media.customThumbnail,
      message: 'Thumbnail generated and uploaded successfully',
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete custom thumbnail
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

    // Delete custom thumbnail from Cloudinary if exists
    if (media.customThumbnailPublicId) {
      try {
        await deleteMedia(media.customThumbnailPublicId);
      } catch (error) {
        console.error('Error deleting thumbnail from Cloudinary:', error);
        // Continue even if deletion fails
      }
    }

    // Remove custom thumbnail from media
    media.customThumbnail = undefined;
    media.customThumbnailPublicId = undefined;
    media.hasCustomThumbnail = false;
    await media.save();

    return NextResponse.json({
      message: 'Custom thumbnail deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
