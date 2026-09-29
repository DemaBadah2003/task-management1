'use client';

import { useEffect, useState } from 'react';

// نفس منطق logoutApi: Cookie أولاً، ثم localStorage، ثم sessionStorage
function readSessionToken(): string | null {
  if (typeof window === 'undefined') return null;

  const match = document.cookie.match(/(?:^|; )taskly_session=([^;]*)/);
  if (match && match[1]) return decodeURIComponent(match[1]);

  return (
    localStorage.getItem('taskly_session') ||
    sessionStorage.getItem('taskly_session')
  );
}

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // نقرا بعد الـ mount عشان نتجنب مشاكل الـ hydration
    setToken(readSessionToken());
    setLoading(false);
  }, []);

  return { token, loading };
}