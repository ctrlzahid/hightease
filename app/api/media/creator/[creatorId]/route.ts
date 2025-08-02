import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Media } from '@/models/media';
import { checkAccess } from '@/utils/auth';
import connectDB from '@/lib/db';

const ITEMS_PER_PAGE = 20;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await params;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');

    // Verify access
    const hasAccess = await checkAccess(creatorId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query
    const query: any = { creatorId: new Types.ObjectId(creatorId) };
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    // Fetch media with pagination
    const media = await Media.find(query)
      .sort({ _id: -1 })
      .limit(ITEMS_PER_PAGE);

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
