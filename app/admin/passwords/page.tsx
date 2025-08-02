import { Password } from '@/models/password';
import { Creator } from '@/models/creator';
import connectDB from '@/lib/db';
import PasswordsTable from './components/PasswordsTable';

interface SerializedPasswordWithCreator {
  _id: string;
  creatorId: {
    name: string;
    slug: string;
  };
  type: string;
  expiresAt: string | null;
  maxUsages: number;
  usageCount: number;
  createdAt: string;
  isValid: boolean;
}

async function getPasswordsWithCreators(): Promise<
  SerializedPasswordWithCreator[]
> {
  await connectDB();

  const passwords = await Password.find()
    .sort({ createdAt: -1 })
    .populate('creatorId', 'name slug')
    .lean();

  // Type assertion and validation - convert to plain objects
  return passwords.map((password: any) => {
    // Ensure all ObjectIds and Dates are properly serialized
    const serializedPassword = {
      _id: password._id ? password._id.toString() : '',
      creatorId: {
        name: password.creatorId?.name || 'Unknown Creator',
        slug: password.creatorId?.slug || '',
      },
      type: password.type || '',
      expiresAt: password.expiresAt
        ? new Date(password.expiresAt).toISOString()
        : null,
      maxUsages: Number(password.maxUsages) || 0,
      usageCount: Number(password.usageCount) || 0,
      createdAt: password.createdAt
        ? new Date(password.createdAt).toISOString()
        : new Date().toISOString(),
      isValid: checkPasswordValidity(password),
    };
    return serializedPassword;
  });
}

function checkPasswordValidity(password: any): boolean {
  // Check expiration
  if (password.expiresAt && new Date() > password.expiresAt) {
    return false;
  }

  // Check usage count for single-use passwords
  if (password.type === 'single-use' && password.usageCount > 0) {
    return false;
  }

  // Check max usages for multi-use passwords
  if (password.maxUsages && password.usageCount >= password.maxUsages) {
    return false;
  }

  return true;
}

export default async function PasswordsList() {
  const passwords = await getPasswordsWithCreators();

  return <PasswordsTable passwords={passwords as any} />;
}
