import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { Password } from '@/models/password';
import { AccessLog } from '@/models/accessLog';
import { Types } from 'mongoose';

const SALT_ROUNDS = 10;
const ACCESS_COOKIE_NAME = 'creator_access';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export interface CreatePasswordOptions {
  creatorId: string;
  password: string;
  type: 'single-use' | 'multi-use';
  expiresAt?: Date;
  maxUsages?: number;
}

export const createPassword = async (options: CreatePasswordOptions) => {
  const hashedPassword = await hashPassword(options.password);

  return Password.create({
    creatorId: new Types.ObjectId(options.creatorId),
    hashedPassword,
    type: options.type,
    expiresAt: options.expiresAt,
    maxUsages: options.maxUsages,
    usageCount: 0,
  });
};

export const validateAccess = async (
  creatorId: string,
  password: string,
  ipAddress: string,
  userAgent: string
): Promise<boolean> => {
  // Find all valid passwords for this creator
  const passwords = await Password.find({
    creatorId: new Types.ObjectId(creatorId),
  });

  // Try each password
  for (const pwd of passwords) {
    if (!pwd.isValid()) continue;

    const isMatch = await comparePasswords(password, pwd.hashedPassword);
    if (!isMatch) continue;

    // Password matches and is valid
    // Increment usage count
    pwd.usageCount += 1;
    await pwd.save();

    // Log access
    await AccessLog.create({
      passwordId: pwd._id,
      creatorId: pwd.creatorId,
      ipAddress,
      userAgent,
      usedAt: new Date(),
    });

    // Set access cookie
    const cookieStore = cookies();
    const expiresAt =
      pwd.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);

    cookieStore.set({
      name: ACCESS_COOKIE_NAME,
      value: creatorId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });

    return true;
  }

  return false;
};

export const checkAccess = (creatorId: string): boolean => {
  const cookieStore = cookies();
  const accessCookie = cookieStore.get(ACCESS_COOKIE_NAME);

  return accessCookie?.value === creatorId;
};

export const revokeAccess = () => {
  const cookieStore = cookies();
  cookieStore.set({
    name: ACCESS_COOKIE_NAME,
    value: '',
    expires: new Date(0),
  });
};
