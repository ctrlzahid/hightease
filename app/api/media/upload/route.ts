import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Media } from '@/models/media';
import { Creator } from '@/models/creator';
import { uploadImage, uploadVideo } from '@/lib/cloudinary';
import { parseVideoUrl, getVideoThumbnail } from '@/utils/video';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const videoUrls = formData.getAll('videoUrls') as string[];
    const captions = formData.getAll('captions') as string[];
    const creatorId = formData.get('creatorId') as string;

    // Validate inputs
    if (
      (!files || files.length === 0) &&
      (!videoUrls || videoUrls.length === 0)
    ) {
      return NextResponse.json(
        { error: 'No files or video URLs provided' },
        { status: 400 }
      );
    }

    if (!creatorId || !Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json(
        { error: 'Valid creator ID is required' },
        { status: 400 }
      );
    }

    // Verify creator exists
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const uploadedMedia = [];

    for (const file of files) {
      try {
        // Convert file to base64 for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64File = `data:${file.type};base64,${buffer.toString(
          'base64'
        )}`;

        let uploadResult;
        let mediaType: 'image' | 'video';

        // Determine file type and upload accordingly
        if (file.type.startsWith('image/')) {
          mediaType = 'image';
          const imageResult = await uploadImage(base64File);
          uploadResult = { ...imageResult, thumbnail: undefined };
        } else if (file.type.startsWith('video/')) {
          mediaType = 'video';
          uploadResult = await uploadVideo(base64File);
        } else {
          console.error(`Unsupported file type: ${file.type}`);
          continue; // Skip unsupported files
        }

        // Create media record in database
        const media = await Media.create({
          creatorId: new Types.ObjectId(creatorId),
          type: mediaType,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          thumbnail: uploadResult.thumbnail || undefined,
          caption: '', // Can be added later via edit functionality
          uploadType: 'cloudinary',
        });

        uploadedMedia.push(media);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Handle external video URLs
    for (let i = 0; i < videoUrls.length; i++) {
      const videoUrl = videoUrls[i];
      const caption = captions[i] || '';

      if (!videoUrl || !videoUrl.trim()) continue;

      try {
        const videoInfo = parseVideoUrl(videoUrl);
        if (!videoInfo) {
          console.error(`Invalid video URL: ${videoUrl}`);
          continue;
        }

        // Get thumbnail for the video
        const thumbnail = await getVideoThumbnail(videoInfo);

        // Create media record for external video
        const media = await Media.create({
          creatorId: new Types.ObjectId(creatorId),
          type: 'video',
          url: videoInfo.url,
          thumbnail: thumbnail,
          caption: caption,
          uploadType: videoInfo.type,
          externalId: videoInfo.id,
        });

        uploadedMedia.push(media);
      } catch (error) {
        console.error(`Error processing video URL ${videoUrl}:`, error);
        // Continue with other URLs even if one fails
      }
    }

    if (uploadedMedia.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any files' },
        { status: 500 }
      );
    }

    return NextResponse.json(uploadedMedia, { status: 201 });
  } catch (error) {
    console.error('Error in media upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
