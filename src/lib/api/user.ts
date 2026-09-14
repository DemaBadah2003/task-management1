const SUPABASE_URL = "https://pwxmbbdntmvsiiyzhlmh.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_chMoTDsN_gy2m1MK0KbCmA_GBICEBn9";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  jobTitle: string;
}

export const FALLBACK_USER: UserProfile = {
  id: "demo-user-1",
  email: "mahmoud.taha@example.com",
  name: "Mahmoud Taha",
  jobTitle: "PROJECT MANAGER",
};

/**
 * Retrieves session token from cookies or browser storage.
 */
function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;

  // Check cookies first
  const match = document.cookie.match(/(?:^|; )taskly_session=([^;]*)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // Check localStorage & sessionStorage
  return (
    localStorage.getItem("taskly_session") ||
    sessionStorage.getItem("taskly_session")
  );
}

/**
 * Fetches user information from GET /auth/v1/user using token & apikey headers.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const token = getSessionToken();

  if (!token) {
    return FALLBACK_USER;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return FALLBACK_USER;
    }

    const data = await response.json();

    const name =
      data?.user_metadata?.name ||
      data?.user_metadata?.full_name ||
      data?.email?.split("@")[0] ||
      FALLBACK_USER.name;

    const jobTitle =
      data?.user_metadata?.job_title ||
      data?.user_metadata?.jobTitle ||
      FALLBACK_USER.jobTitle;

    return {
      id: data.id || FALLBACK_USER.id,
      email: data.email || FALLBACK_USER.email,
      name,
      jobTitle,
    };
  } catch {
    return FALLBACK_USER;
  }
}
