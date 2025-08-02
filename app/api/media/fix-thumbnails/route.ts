import { NextRequest, NextResponse } from 'next/server';
import { Media } from '@/models/media';
import { parseVideoUrl, getVideoThumbnail } from '@/utils/video';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Find all videos without thumbnails or with broken thumbnails
    const videosWithoutThumbnails = await Media.find({
      type: 'video',
      uploadType: { $in: ['youtube', 'vimeo'] },
      $or: [
        { thumbnail: null },
        { thumbnail: { $exists: false } },
        { thumbnail: '' },
        { thumbnail: { $regex: /placeholder/ } }, // Fix any placeholder thumbnails
      ],
    });

    console.log(
      `Found ${videosWithoutThumbnails.length} videos without proper thumbnails`
    );

    const results = [];

    for (const video of videosWithoutThumbnails) {
      try {
        console.log(`Processing video: ${video.url}`);

        const videoInfo = parseVideoUrl(video.url);
        if (!videoInfo) {
          console.log(`Could not parse URL: ${video.url}`);
          results.push({
            id: video._id,
            status: 'failed',
            reason: 'Invalid URL',
          });
          continue;
        }

        let thumbnailUrl = null;

        if (videoInfo.type === 'youtube') {
          thumbnailUrl = videoInfo.thumbnail;
        } else if (videoInfo.type === 'vimeo') {
          thumbnailUrl = await getVideoThumbnail(videoInfo);
        }

        if (thumbnailUrl) {
          await Media.findByIdAndUpdate(video._id, {
            $set: {
              thumbnail: thumbnailUrl,
              externalId: videoInfo.id,
              uploadType: videoInfo.type,
            },
          });

          console.log(`Updated thumbnail for video: ${video._id}`);
          results.push({
            id: video._id,
            status: 'success',
            thumbnail: thumbnailUrl,
            uploadType: videoInfo.type,
            externalId: videoInfo.id,
          });
        } else {
          console.log(`Could not get thumbnail for: ${video.url}`);
          results.push({
            id: video._id,
            status: 'failed',
            reason: 'No thumbnail available',
          });
        }
      } catch (error) {
        console.error(`Error processing video ${video._id}:`, error);
        results.push({
          id: video._id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: videosWithoutThumbnails.length,
      results,
    });
  } catch (error) {
    console.error('Error fixing thumbnails:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
