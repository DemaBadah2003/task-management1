import type { Metadata } from 'next';
import MembersView from '@/src/components/members/MembersView';

export const metadata: Metadata = {
  title: 'Members · Taskly',
};

export default function ProjectMembersPage() {
  return <MembersView />;
}
