import Link from 'next/link';
import CreateEpicForm from '@/src/components/epics/CreateEpicForm';

export default async function EpicsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
      {/* Breadcrumbs - مخفي في الموبايل ويظهر في الشاشات المتوسطة والأكبر (Desktop) */}
      <div className="mb-4 hidden items-center gap-2 text-[12px] font-semibold tracking-[0.3px] uppercase md:flex">
        <Link href="/projects" className="text-[#434654]/95 hover:underline">
          Projects
        </Link>
        <span className="text-[#434654]/60">/</span>
        <Link
          href={`/project/${projectId}`}
          className="text-[#434654]/95 hover:underline"
        >
          Project Alpha
        </Link>
        <span className="text-[#434654]/60">/</span>
        <Link
          href={`/project/${projectId}/epics`}
          className="text-[#434654]/95 hover:underline"
        >
          Epics
        </Link>
        <span className="text-[#434654]/60">/</span>
        <span className="text-[#041B3C]">New Epic</span>
      </div>

      {/* Header Titles */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[36px] leading-[40px] font-bold tracking-[-0.9px] text-[#041B3C]">
          Create New Epic
        </h1>
        <p className="text-[16px] leading-[24px] font-normal text-[#434654]">
          Define a major project phase or high-level milestone to group related
          tasks and track architectural progress.
        </p>
      </div>

      {/* Form Component */}
      <div className="mt-8">
        <CreateEpicForm projectId={projectId} />
      </div>
    </div>
  );
}
