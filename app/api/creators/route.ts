import { NextRequest, NextResponse } from 'next/server';
import { Creator } from '@/models/creator';
import { isValidSlug } from '@/utils/slug';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const creators = await Creator.find().sort({ createdAt: -1 });
    return NextResponse.json(creators);
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

    // Check if slug is already taken
    const existingCreator = await Creator.findOne({ slug });
    if (existingCreator) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 400 }
      );
    }

    // Create new creator
    const creator = await Creator.create({
      name,
      slug,
      bio: bio || '',
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
