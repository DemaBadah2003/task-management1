'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectCard } from './ProjectCard';
import { AddProjectCard } from './AddProjectCard';
import { AddProjectFab } from './AddProjectFab';
import { Pagination } from './Pagination';
import { ProjectsEmptyState } from './ProjectsEmptyState';
import { ProjectsLoadingSkeleton } from './ProjectsLoadingSkeleton';
import { ProjectsErrorState } from './ProjectsErrorState';
import { useMediaQuery } from '@/src/hooks/useMediaQuery';
import { PAGE_SIZE } from '@/src/lib/pagination';
import type { Project, ProjectsResponse } from '@/src/types/project';

// Adjust to your actual login route.
const LOGIN_PATH = '/login';

interface ProjectsListProps {
  initialProjects?: Project[];
  status?: 'loading' | 'success' | 'error';
  onRetry?: () => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  basePath?: string;
}

export function ProjectsList({
  initialProjects = [],
  status = 'success',
  onRetry,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  basePath = '/project',
}: ProjectsListProps) {
  const router = useRouter();
  // موبايل + تابلت = infinite scroll، ديسكتوب فقط = pagination
  const isInfinite = useMediaQuery('(max-width: 1023px)');

  const [extraProjects, setExtraProjects] = useState<Project[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  // ✱ total بيتحدّث من كل response بدل الاعتماد على الـ prop فقط
  const [total, setTotal] = useState(totalCount);
  // ✱ لو رجع فاضي أو كله مكرر، نوقف التحميل عشان ما نلف للأبد
  const [exhausted, setExhausted] = useState(false);

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ✱ صفّر الحالة لما تتغيّر البيانات الأولية (تنقّل / refresh)
  useEffect(() => {
    setExtraProjects([]);
    setTotal(totalCount);
    setExhausted(false);
    setLoadMoreError(false);
  }, [initialProjects, totalCount]);

  const projects = isInfinite
    ? [...initialProjects, ...extraProjects]
    : initialProjects;

  const nextOffset =
    (currentPage - 1) * PAGE_SIZE +
    initialProjects.length +
    extraProjects.length;
  // ✱ يعتمد على total المحدّث و exhausted
  const hasMore = !exhausted && nextOffset < total;

  // موبايل + تابلت يبدأوا دايماً من أول القائمة (والسكرول بيحمّل الباقي)
  const mustRestart = isInfinite && currentPage > 1;

  useEffect(() => {
    if (mustRestart) router.replace(basePath);
  }, [mustRestart, basePath, router]);

  const loadMore = useCallback(async () => {
    // منع الطلبات المكررة + منع الطلب لما المشاريع خلصت
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const res = await fetch(
        `/api/projects?limit=${PAGE_SIZE}&offset=${nextOffset}`,
        { cache: 'no-store' } // ✱ منع الكاش
      );

      if (res.status === 401) {
        router.replace(LOGIN_PATH);
        return;
      }
      if (!res.ok) throw new Error('Failed to load projects');

      const data: ProjectsResponse = await res.json();

      // ✱ حدّث العدد الكلي من الـ response
      setTotal(data.totalCount);

      // ✱ رجع فاضي → خلصت المشاريع
      if (data.projects.length === 0) {
        setExhausted(true);
        return;
      }

      // ✱ حساب المشاريع الجديدة خارج الـ setState (بدون side effects جوا الـ updater)
      const existing = new Set(
        [...initialProjects, ...extraProjects].map((p) => p.id)
      );
      const fresh = data.projects.filter((p) => !existing.has(p.id));

      // ✱ كل المرجّع مكرر → وقّف عشان ما نلف للأبد
      if (fresh.length === 0) {
        setExhausted(true);
        return;
      }

      setExtraProjects((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        return [...prev, ...fresh.filter((p) => !prevIds.has(p.id))];
      });
    } catch {
      // المشاريع المحملة تضل ظاهرة، بس نوقف الـ indicator
      setLoadMoreError(true);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, nextOffset, initialProjects, extraProjects, router]);

  // Infinite scroll: موبايل + تابلت، وبنوقف المراقبة لو صار خطأ (الـ Retry بيكمل)
  useEffect(() => {
    if (!isInfinite || mustRestart || !hasMore || loadMoreError) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    isInfinite,
    mustRestart,
    hasMore,
    loadMoreError,
    loadMore,
    extraProjects.length, // ✱ يعيد الـ observe بعد كل دفعة (مهم للتابلت)
  ]);

  if (status === 'loading') return <ProjectsLoadingSkeleton />;
  if (status === 'error')
    return <ProjectsErrorState onRetry={onRetry ?? (() => {})} />;
  if (mustRestart) return <ProjectsLoadingSkeleton />;
  if (projects.length === 0) return <ProjectsEmptyState />;

  return (
    <div className="@container flex flex-1 flex-col gap-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[36px] leading-[40px] font-semibold tracking-[-0.9px] text-slate-900">
            Projects
          </h1>
          <p className="text-[14px] leading-[20px] text-slate-600">
            Manage and curate your projects
          </p>
        </div>

        <Link
          href="/project/add"
          className="bg-btn-gradient-card hidden shrink-0 items-center justify-center gap-2 rounded-[2px] px-6 py-3 text-center align-middle text-[16px] leading-[24px] font-medium whitespace-nowrap text-white md:flex"
        >
          Create New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        <AddProjectCard />
      </div>

      {/* Infinite scroll (موبايل + تابلت) */}
      {isInfinite && (
        <>
          {hasMore && !loadMoreError && (
            <div ref={sentinelRef} className="h-1" />
          )}

          {loadingMore && (
            <p
              className="py-4 text-center text-sm text-slate-500"
              role="status"
            >
              Loading more projects...
            </p>
          )}

          {loadMoreError && (
            <div className="py-4 text-center">
              <p className="text-sm text-red-600">Failed to load projects</p>
              <button
                type="button"
                className="mt-2 rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                onClick={loadMore}
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}

      {/* Pagination (ديسكتوب فقط) */}
      {!isInfinite && (
        <div className="mt-auto flex min-h-10 w-full items-center justify-end pt-8 pb-10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}

      <AddProjectFab />
    </div>
  );
}
