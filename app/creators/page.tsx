import { redirect } from 'next/navigation';

export default function CreatorsList() {
  // Redirect to homepage since creators are now shown there
  redirect('/');
}
