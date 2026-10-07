import { redirect } from 'next/navigation';
import EpicsHeader from '@/src/components/epics/EpicsHeader';
import EpicCard from '@/src/components/epics/EpicCard';
import { fetchEpics, EpicsFetchError } from '@/src/lib/epics';
import { PAGE_SIZE } from '@/src/lib/pagination';
import type { EpicsResponse } from '@/src/types/epic';

export const dynamic = 'force-dynamic';

// TODO: اسم المشروع الحقيقي من الـ API
const PROJECT_NAME = 'Rafiq';

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

function parsePage(value?: string): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export default async function EpicsPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const query = sp.q?.trim() || undefined;
  const basePath = `/project/${projectId}/epics`;

  let data: EpicsResponse | null = null;
  let unauthorized = false;

  try {
    data = await fetchEpics({
      projectId,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      q: query,
    });
  } catch (err) {
    unauthorized = err instanceof EpicsFetchError && err.status === 401;
  }

  if (unauthorized) redirect('/login');

  const totalPages = Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE);
  if (data && totalPages > 0 && page > totalPages) {
    redirect(totalPages === 1 ? basePath : `${basePath}?page=${totalPages}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8">
      <EpicsHeader
        projectId={projectId}
        projectName={PROJECT_NAME}
        query={query}
      />

      {data === null ? (
        <p role="alert" className="text-sm text-[#BA1A1A]">
          Couldn&apos;t load epics. Refresh the page to try again.
        </p>
      ) : data.epics.length === 0 ? (
        <p className="text-sm text-[#434654]">
          {query
            ? `No epics match "${query}".`
            : 'No epics yet. Create the first one with New Epic.'}
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {data.epics.map((epic) => (
            <EpicCard key={epic.id} epic={epic} />
          ))}
        </section>
      )}
    </div>
  );
}
