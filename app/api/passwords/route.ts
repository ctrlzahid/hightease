import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { createPassword, CreatePasswordOptions } from '@/utils/auth';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { creatorId, password, type, expiresAt, maxUsages } =
      await request.json();

    // Validate required fields
    if (!creatorId || !password || !type) {
      return NextResponse.json(
        { error: 'Creator ID, password, and type are required' },
        { status: 400 }
      );
    }

    // Validate creator ID format
    if (!Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json(
        { error: 'Invalid creator ID' },
        { status: 400 }
      );
    }

    // Validate password type
    if (!['single-use', 'multi-use'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid password type' },
        { status: 400 }
      );
    }

    // Create password options
    const options: CreatePasswordOptions = {
      creatorId,
      password,
      type,
    };

    // Add optional fields if provided
    if (expiresAt) {
      options.expiresAt = new Date(expiresAt);
    }

    if (maxUsages && type === 'multi-use') {
      options.maxUsages = parseInt(maxUsages.toString());
    }

    // Create the password
    const newPassword = await createPassword(options);

    return NextResponse.json(
      {
        id: newPassword._id,
        creatorId: newPassword.creatorId,
        type: newPassword.type,
        expiresAt: newPassword.expiresAt,
        maxUsages: newPassword.maxUsages,
        usageCount: newPassword.usageCount,
        createdAt: newPassword.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
