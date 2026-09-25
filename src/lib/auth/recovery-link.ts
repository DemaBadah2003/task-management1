export const RECOVERY_TOKEN_STORAGE_KEY = 'taskly_recovery_access_token';

export type RecoveryLinkParams = {
  accessToken: string | null;
  type: string | null;
  error: string | null;
};

function readParams(source: string): URLSearchParams {
  const raw = source.startsWith('#') ? source.slice(1) : source;
  return new URLSearchParams(raw);
}

/** Reads recovery tokens from the hash or query string without rendering them. */
export function parseRecoveryLink(
  hash = typeof window === 'undefined' ? '' : window.location.hash,
  search = typeof window === 'undefined' ? '' : window.location.search
): RecoveryLinkParams {
  const fromHash = readParams(hash);
  const fromSearch = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search
  );

  return {
    accessToken:
      fromHash.get('access_token') ?? fromSearch.get('access_token'),
    type: fromHash.get('type') ?? fromSearch.get('type'),
    error: fromHash.get('error') ?? fromSearch.get('error'),
  };
}

export function storeRecoveryAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RECOVERY_TOKEN_STORAGE_KEY, token);
}

export function readStoredRecoveryAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(RECOVERY_TOKEN_STORAGE_KEY);
}

export function clearStoredRecoveryAccessToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RECOVERY_TOKEN_STORAGE_KEY);
}

export function stripAuthParamsFromUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.hash = '';
  [
    'access_token',
    'refresh_token',
    'expires_in',
    'expires_at',
    'token_type',
    'type',
    'error',
    'error_code',
    'error_description',
  ].forEach((key) => url.searchParams.delete(key));
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}
