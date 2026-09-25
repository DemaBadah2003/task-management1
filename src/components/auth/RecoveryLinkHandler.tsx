'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  parseRecoveryLink,
  storeRecoveryAccessToken,
  stripAuthParamsFromUrl,
} from '@/src/lib/auth/recovery-link';

/**
 * Detects Supabase recovery hashes (`type=recovery`) on any route,
 * stores the access token off-screen, and sends the user to /reset-password.
 */
export function RecoveryLinkHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { accessToken, type, error } = parseRecoveryLink();

    if (type !== 'recovery' && !accessToken && !error) {
      return;
    }

    if (type === 'recovery' && accessToken) {
      storeRecoveryAccessToken(accessToken);
      stripAuthParamsFromUrl();
      if (pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
      return;
    }

    if (error || (type === 'recovery' && !accessToken)) {
      stripAuthParamsFromUrl();
      if (pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
    }
  }, [pathname, router]);

  return null;
}
