const INTERNAL_ORIGIN = 'https://taskly.invalid';

export function getSafeInternalRedirect(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return null;
  }

  try {
    const url = new URL(path, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}