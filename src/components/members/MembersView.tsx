'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/src/context/user-context';
import { useActiveProject } from '@/src/context/project-context';
import useProjectMembers from '@/src/hooks/useProjectMembers';
import { MembersHeader } from './MembersHeader';
import InviteMemberDialog from './InviteMemberDialog';
import { MembersList } from './MembersList';
import { MembersLoadingSkeleton } from './MembersLoadingSkeleton';
import { MembersErrorState } from './MembersErrorState';
import { MembersEmptyState } from './MembersEmptyState';

export default function MembersView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { members, status, retry } = useProjectMembers(projectId);
  const { user, loading: userLoading } = useUser();
  const { activeProjectName } = useActiveProject();
  const [inviteOpen, setInviteOpen] = useState(false);

  // حالة التحميل: عرض السكيلتون لوحده (بدون الهيدر)
  if (status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <MembersLoadingSkeleton />
      </div>
    );
  }

  // حالة الخطأ: عرض رسالة الخطأ وحدها في المنتصف (بدون الهيدر) تماماً مثل تصميم Figma
  if (status === 'error') {
    return <MembersErrorState onRetry={retry} />;
  }

  // حالة النجاح: عرض الهيدر والمحتوى (قائمة الأعضاء أو الحالة الفارغة)
  const currentMember = members.find(
    (member) =>
      member.id === user.id ||
      member.email.toLowerCase() === user.email.toLowerCase()
  );
  const canInvite =
    !userLoading &&
    (currentMember?.role === 'owner' || currentMember?.role === 'admin');

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <MembersHeader
        canInvite={canInvite}
        onInviteClick={() => setInviteOpen(true)}
      />
      {members.length === 0 ? (
        <MembersEmptyState />
      ) : (
        <div className="mt-6 md:mt-0">
          <MembersList members={members} />
        </div>
      )}
      {canInvite && inviteOpen ? (
        <InviteMemberDialog
          projectId={projectId}
          projectName={activeProjectName ?? undefined}
          onClose={() => setInviteOpen(false)}
        />
      ) : null}
    </div>
  );
}
