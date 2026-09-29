'use client';

import { useParams } from 'next/navigation';
import { useProjectMembers } from '@/src/hooks/useProjectMembers';
import { MembersHeader } from './MembersHeader';
import { MembersList } from './MembersList';
import { MembersLoadingSkeleton } from './MembersLoadingSkeleton';
import { MembersErrorState } from './MembersErrorState';
import { MembersEmptyState } from './MembersEmptyState';

export default function MembersView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { members, status, retry } = useProjectMembers(projectId);

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
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <MembersHeader />
      {members.length === 0 ? (
        <MembersEmptyState />
      ) : (
        <div className="mt-6 md:mt-0">
          <MembersList members={members} />
        </div>
      )}
    </div>
  );
}
