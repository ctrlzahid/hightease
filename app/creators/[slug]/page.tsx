import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Creator } from '@/models/creator';
import { Media } from '@/models/media';
import { checkAccess } from '@/utils/auth';
import connectDB from '@/lib/db';
import Header from '@/app/components/Header';
import CreatorHeader from './components/CreatorHeader';
import ContentTabs from './components/ContentTabs';
import PasswordForm from './components/PasswordForm';
import TokenValidator from './components/TokenValidator';

interface CreatorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const creator = await Creator.findOne({ slug });

  if (!creator) {
    return {
      title: 'Creator Not Found',
    };
  }

  return {
    title: `${creator.name} - Exclusive Content`,
    description: creator.bio,
  };
}

export default async function CreatorPage({
  params,
  searchParams,
}: CreatorPageProps & { searchParams: Promise<{ token?: string }> }) {
  const { slug } = await params;
  const { token } = await searchParams;
  await connectDB();
  const creator = await Creator.findOne({ slug });

  if (!creator) {
    notFound();
  }

  // Check if user has access
  const hasAccess = await checkAccess(creator._id.toString());

  // If token is provided but no access, show token validator
  if (!hasAccess && token) {
    return (
      <div className='min-h-screen text-white'>
        <Header />
        <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-8'>
          <CreatorHeader creator={JSON.parse(JSON.stringify(creator))} />
          <TokenValidator
            creatorId={creator._id.toString()}
            creatorSlug={creator.slug}
            token={token}
          />
        </div>
      </div>
    );
  }

  // If no access, show password form
  if (!hasAccess) {
    return (
      <div className='min-h-screen text-white'>
        <Header />
        <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-8'>
          <CreatorHeader creator={JSON.parse(JSON.stringify(creator))} />
          <div className='max-w-md mx-auto'>
            <PasswordForm creatorId={creator._id.toString()} />
          </div>
        </div>
      </div>
    );
  }

  // Fetch creator's media
  const media = await Media.find({ creatorId: creator._id }).sort({
    createdAt: -1,
  });

  return (
    <div className='min-h-screen text-white'>
      <Header />
      <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-8'>
        <CreatorHeader creator={JSON.parse(JSON.stringify(creator))} />
        <ContentTabs media={JSON.parse(JSON.stringify(media))} />
      </div>
    </div>
  );
}
