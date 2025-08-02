'use client';

import Link from 'next/link';
import { Types } from 'mongoose';
import DeletePasswordButton from './DeletePasswordButton';

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

interface PasswordsTableProps {
  passwords: PasswordWithCreator[];
}

export default function PasswordsTable({ passwords }: PasswordsTableProps) {
  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8'>
        <h1 className='text-xl sm:text-2xl font-bold text-white'>
          Access Passwords
        </h1>
        <Link
          href='/admin/passwords/new'
          className='bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-lg'
        >
          + Generate Password
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className='hidden md:block bg-gray-900/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-700'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead className='bg-gray-800'>
            <tr>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Creator
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Type
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Usage
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Expires
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Created
              </th>
              <th className='px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-gray-900/50 divide-y divide-gray-700'>
            {passwords.map((password) => (
              <tr
                key={password._id.toString()}
                className='hover:bg-gray-800/50'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium text-white'>
                    {password.creatorId.name}
                  </div>
                  <div className='text-sm text-gray-400'>
                    /{password.creatorId.slug}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 capitalize'>
                    {password.type.replace('-', ' ')}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-300'>
                    {password.usageCount}
                    {password.maxUsages ? ` / ${password.maxUsages}` : ''}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-300'>
                    {password.expiresAt
                      ? new Date(password.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      password.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {password.isValid ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-300'>
                    {new Date(password.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-center'>
                  <DeletePasswordButton
                    passwordId={password._id.toString()}
                    creatorName={password.creatorId.name}
                  />
                </td>
              </tr>
            ))}
            {passwords.length === 0 && (
              <tr>
                <td colSpan={7} className='px-6 py-8 text-center text-gray-400'>
                  No passwords found. Generate your first password to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='md:hidden space-y-4'>
        {passwords.map((password) => (
          <div
            key={password._id.toString()}
            className='bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg overflow-hidden'
          >
            <div className='p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    {password.creatorId.name}
                  </h3>
                  <p className='text-sm text-gray-400'>
                    /{password.creatorId.slug}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    password.isValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {password.isValid ? 'Active' : 'Expired'}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                    Type
                  </p>
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 capitalize'>
                    {password.type.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                    Usage
                  </p>
                  <p className='text-sm text-gray-300'>
                    {password.usageCount}
                    {password.maxUsages ? ` / ${password.maxUsages}` : ''}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                    Expires
                  </p>
                  <p className='text-sm text-gray-300'>
                    {password.expiresAt
                      ? new Date(password.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                    Created
                  </p>
                  <p className='text-sm text-gray-300'>
                    {new Date(password.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className='border-t border-gray-700 p-4 bg-gray-800/50 text-center'>
              <DeletePasswordButton
                passwordId={password._id.toString()}
                creatorName={password.creatorId.name}
              />
            </div>
          </div>
        ))}

        {passwords.length === 0 && (
          <div className='bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg p-8 text-center'>
            <p className='text-gray-400'>
              No passwords found. Generate your first password to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
