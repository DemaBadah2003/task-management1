'use client';

import { useEffect, useState } from 'react';
import TasksBoard from './TasksBoard';
import TasksPageHeader from './TasksPageHeader';

export default function ProjectTasksWorkspace({
  projectId,
}: {
  projectId: string;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 p-4 md:p-8">
      <TasksPageHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />
      <TasksBoard projectId={projectId} searchTerm={searchTerm} />
    </div>
  );
}
