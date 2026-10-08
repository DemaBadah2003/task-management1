'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import EpicCard from '@/src/components/epics/EpicCard';
import EpicsHeader from '@/src/components/epics/EpicsHeader';
import { CreateEpicModal } from '@/src/components/epics/CreateEpicModal';
import { EpicDetailsModal } from '@/src/components/epics/EpicDetailsModal';
import { EpicsEmptyState } from '@/src/components/epics/EpicsEmptyState';
import { EpicsErrorState } from '@/src/components/epics/EpicsErrorState';
import { EpicsLoadingSkeleton } from '@/src/components/epics/EpicsLoadingSkeleton';
import { EpicsPagination } from '@/src/components/epics/EpicsPagination';
import NewEpics from '@/src/components/icons/NewEpics';
import { useActiveProject } from '@/src/context/project-context';
import { useMediaQuery } from '@/src/hooks/useMediaQuery';
import { useProjectEpics } from '@/src/hooks/useProjectEpics';

const SEARCH_DEBOUNCE_MS = 300;

export default function EpicsView({ projectId }: { projectId: string }) {
  const { activeProjectId, activeProjectName } = useActiveProject();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const {
    epics,
    currentPage,
    totalPages,
    hasMore,
    loading,
    error,
    moreLoading,
    moreError,
    setPage,
    retry,
    loadMore,
  } = useProjectEpics(projectId, isMobile, searchTerm);
  const loadMoreTrigger = useRef<HTMLDivElement>(null);
  const closeDetails = useCallback(() => setSelectedEpicId(null), []);
  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  useEffect(() => {
    setSearchInput('');
    setSearchTerm('');
  }, [projectId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const target = loadMoreTrigger.current;
    if (!isMobile || !target || !hasMore || moreLoading || moreError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: '0px 0px 160px 0px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isMobile, loadMore, moreError, moreLoading]);

  const projectName =
    activeProjectId === projectId ? activeProjectName ?? projectId : projectId;
  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col">
      <EpicsHeader
        projectId={projectId}
        projectName={projectName}
        query={searchInput}
        onQueryChange={setSearchInput}
        onNewEpic={openCreate}
      />
      {loading ? (
        <div className="mt-6">
          <EpicsLoadingSkeleton cardsOnly />
        </div>
      ) : error ? (
        <EpicsErrorState
          onRetry={retry}
          title={hasActiveSearch ? 'Failed to search epics' : 'Failed to load epics'}
        />
      ) : epics.length === 0 ? (
        hasActiveSearch ? (
          <EpicsEmptyState
            title="No epics found matching your search"
            description=""
            showCreateAction={false}
          />
        ) : (
          <EpicsEmptyState onCreate={openCreate} />
        )
      ) : (
        <>
          <section
            aria-label="Project epics"
            className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2"
          >
            {epics.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                onSelect={setSelectedEpicId}
              />
            ))}
          </section>
          <EpicsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            onPageChange={setPage}
          />
          <div ref={loadMoreTrigger} aria-hidden="true" className="h-1 md:hidden" />
          {moreLoading && (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-4 text-sm text-[#434654] md:hidden"
            >
              <span className="size-4 animate-spin rounded-full border-2 border-[#D7E2FF] border-t-[#003D9B]" />
              Loading more epics...
            </div>
          )}
          {moreError && (
            <div
              role="alert"
              className="flex flex-col items-center gap-2 py-4 text-sm text-[#434654] md:hidden"
            >
              <span>Failed to load epics</span>
              <button
                type="button"
                onClick={() => void loadMore()}
                className="font-semibold text-[#003D9B] underline"
              >
                Try again
              </button>
            </div>
          )}
        </>
      )}
      <button
        type="button"
        aria-label="New Epic"
        onClick={openCreate}
        className="fixed right-4 bottom-20 z-30 flex size-12 items-center justify-center rounded-full bg-[#003D9B] shadow-[0px_4px_8px_rgba(0,0,0,0.1)] md:hidden"
      >
        <NewEpics aria-hidden="true" className="size-4" />
      </button>
      {selectedEpicId && (
        <EpicDetailsModal
          key={`${projectId}:${selectedEpicId}`}
          projectId={projectId}
          epicId={selectedEpicId}
          onClose={closeDetails}
        />
      )}
      {isCreateOpen && (
        <CreateEpicModal
          projectId={projectId}
          onClose={closeCreate}
          onCreated={retry}
        />
      )}
    </div>
  );
}
