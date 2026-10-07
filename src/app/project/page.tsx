import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProjectsView } from '@/src/components/projects/projectViews';
import { fetchProjects, ProjectsFetchError } from '@/src/lib/projects';
import { PAGE_SIZE } from '@/src/lib/pagination';
import type { ProjectsResponse } from '@/src/types/project';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function parsePage(value?: string): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  return {
    title:
      page === 1 ? 'Projects · Taskly' : `Projects - Page ${page} · Taskly`,
    alternates: {
      canonical: page === 1 ? '/project' : `/project?page=${page}`,
    },
  };
}

export default async function ProjectsPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  const offset = (page - 1) * PAGE_SIZE;

  let data: ProjectsResponse | null = null;
  let unauthorized = false;

  try {
    data = await fetchProjects({ limit: PAGE_SIZE, offset });
  } catch (err) {
    unauthorized = err instanceof ProjectsFetchError && err.status === 401;
  }

  // redirect لازم يكون برا الـ try/catch
  if (unauthorized) redirect('/login');

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // رقم صفحة أكبر من الموجود → رجّعه لآخر صفحة
  if (data && totalPages > 0 && page > totalPages) {
    redirect(totalPages === 1 ? '/project' : `/project?page=${totalPages}`);
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      {/* key={page} عشان state الموبايل (infinite scroll) يتصفّر عند تغيير الصفحة */}
      <ProjectsView
        key={page}
        initialProjects={data?.projects ?? []}
        totalCount={totalCount}
        page={page}
        hasError={data === null}
      />
    </div>
  );
}
