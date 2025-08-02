'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCheck() {
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const cookieToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('adminToken='))
      ?.split('=')[1];

    if (
      !adminToken ||
      !cookieToken ||
      adminToken !== process.env.NEXT_PUBLIC_ADMIN_TOKEN
    ) {
      router.push('/admin/login');
    }
  }, [router]);

  return null;
}
