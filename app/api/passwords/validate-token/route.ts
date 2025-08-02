import { NextRequest, NextResponse } from 'next/server';
import { validateAccess } from '@/utils/auth';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { creatorId, token } = await request.json();

    if (!creatorId || !token) {
      return NextResponse.json(
        { error: 'Creator ID and token are required' },
        { status: 400 }
      );
    }

    // Get IP and user agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const isValid = await validateAccess(
      creatorId,
      token,
      ipAddress.split(',')[0], // Get first IP if multiple
      userAgent
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
