import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Members · Taskly',
};

export default function MembersPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <h1 className="text-[24px] font-bold text-slate-900">Project Members</h1>
      <p className="text-[14px] text-slate-600">
        Members assigned to active project.
      </p>
      <div className="border-card-border rounded-2xl border bg-white p-6">
        <span className="text-[14px] font-semibold text-slate-900">
          Project members list placeholder.
        </span>
      </div>
    </div>
  );
}
