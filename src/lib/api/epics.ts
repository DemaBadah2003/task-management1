import { ApiError } from '@/src/lib/api/members'; // عدّل المسار حسب مكان الملف

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type CreateEpicPayload = {
  title: string;
  project_id: string;
  description?: string;
  assignee_id?: string;
  deadline?: string; // YYYY-MM-DD
};

export async function createEpic(
  payload: CreateEpicPayload,
  token: string,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${BASE_URL}/rest/v1/epics`, {
    method: 'POST',
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let message = 'Failed to create epic. Please try again.';
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {
      // الرد مش JSON، نستخدم الرسالة الافتراضية
    }
    throw new ApiError(message, response.status);
  }
}