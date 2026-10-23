import type { Metadata } from 'next';
import AcceptInvitation from '@/src/components/members/AcceptInvitation';

export const metadata: Metadata = {
  title: 'Accept Invitation · Taskly',
  description: 'Accept your invitation to join a Taskly project.',
};

interface InvitePageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return <AcceptInvitation token={token?.trim() ?? ''} />;
}
