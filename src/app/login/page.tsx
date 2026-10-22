'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (redirect) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.replace('/auth/login');
    }
  }, [router, redirect]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginRedirect />
    </Suspense>
  );
}
