import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EpicsHeader from '@/src/components/epics/EpicsHeader';
import EpicCard from '@/src/components/epics/EpicCard';
import { fetchEpics, EpicsFetchError } from '@/src/lib/epics';
import { PAGE_SIZE } from '@/src/lib/pagination';
import type { EpicsResponse } from '@/src/types/epic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
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
    title: page === 1 ? 'Epics · Taskly' : `Epics - Page ${page} · Taskly`,
  };
}

export default async function EpicsPage({ params, searchParams }: Props) {
  const { projectId } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const query = sp.q?.trim() || undefined;
  const basePath = `/project/${projectId}/epics`;
  const offset = (page - 1) * PAGE_SIZE;

  let data: EpicsResponse | null = null;
  let unauthorized = false;

  try {
    data = await fetchEpics({ projectId, limit: PAGE_SIZE, offset, q: query });
  } catch (err) {
    unauthorized = err instanceof EpicsFetchError && err.status === 401;
  }

  // redirect لازم يكون برا الـ try/catch
  if (unauthorized) redirect('/login');

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // رقم صفحة أكبر من الموجود → رجّعه لآخر صفحة
  if (data && totalPages > 0 && page > totalPages) {
    redirect(totalPages === 1 ? basePath : `${basePath}?page=${totalPages}`);
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-8">
      <EpicsHeader projectId={projectId} query={query} />

      {data === null ? (
        <p role="alert" className="text-sm text-[#BA1A1A]">
          Couldn&apos;t load epics. Refresh the page to try again.
        </p>
      ) : data.epics.length === 0 ? (
        <p className="text-sm text-[#434654]">
          {query
            ? `No epics match “${query}”.`
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
