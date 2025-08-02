import { Password } from '@/models/password';
import { Creator } from '@/models/creator';
import Link from 'next/link';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

interface PasswordWithCreator {
  _id: Types.ObjectId;
  creatorId: {
    name: string;
    slug: string;
  };
  type: 'single-use' | 'multi-use';
  expiresAt?: Date;
  maxUsages?: number;
  usageCount: number;
  createdAt: Date;
  isValid: boolean;
}

async function getPasswordsWithCreators(): Promise<PasswordWithCreator[]> {
  await connectDB();

  const passwords = await Password.find()
    .sort({ createdAt: -1 })
    .populate('creatorId', 'name slug')
    .lean();

  // Type assertion and validation
  return passwords.map((password: any) => ({
    _id: password._id,
    creatorId: {
      name: password.creatorId?.name || 'Unknown Creator',
      slug: password.creatorId?.slug || '',
    },
    type: password.type,
    expiresAt: password.expiresAt,
    maxUsages: password.maxUsages,
    usageCount: password.usageCount,
    createdAt: password.createdAt,
    isValid: checkPasswordValidity(password),
  }));
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

  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Access Passwords</h1>
        <Link
          href='/admin/passwords/new'
          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
        >
          Generate Password
        </Link>
      </div>

      <div className='bg-white shadow rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Creator
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Usage
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Expires
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {passwords.map((password) => (
              <tr key={password._id.toString()}>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {password.creatorId.name}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 capitalize'>
                    {password.type.replace('-', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {password.usageCount}
                    {password.maxUsages ? ` / ${password.maxUsages}` : ''}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {password.expiresAt
                      ? new Date(password.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      password.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {password.isValid ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900'>
                    {new Date(password.createdAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
            {passwords.length === 0 && (
              <tr>
                <td colSpan={6} className='px-6 py-4 text-center text-gray-500'>
                  No passwords found. Generate your first password to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
