'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useParams } from 'next/navigation';
import CreateTaskModal from '@/src/components/tasks/CreateTaskModal';
import type { Task, TaskStatus } from '@/src/types/task';

interface OpenOptions {
  epicId?: string | null; // يُمرَّر من Epic Detail Popup
  status?: TaskStatus;
}

interface CreateTaskModalContextValue {
  openCreateTask: (options?: OpenOptions) => void;
  lastCreatedTask: Task | null;
}

const CreateTaskModalContext =
  createContext<CreateTaskModalContextValue | null>(null);

export function useCreateTaskModal() {
  const ctx = useContext(CreateTaskModalContext);
  if (!ctx) {
    throw new Error(
      'useCreateTaskModal must be used inside <CreateTaskModalProvider>'
    );
  }
  return ctx;
}

export default function CreateTaskModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { projectId } = useParams<{ projectId: string }>();
  const [modal, setModal] = useState({
    isOpen: false,
    epicId: null as string | null,
    status: null as TaskStatus | null,
    nonce: 0, // يتغير عند كل فتح فيُعاد تصفير النموذج
  });
  const [lastCreatedTask, setLastCreatedTask] = useState<Task | null>(null);

  const openCreateTask = useCallback((options?: OpenOptions) => {
    setModal((prev) => ({
      isOpen: true,
      epicId: options?.epicId ?? null,
      status: options?.status ?? null,
      nonce: prev.nonce + 1,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({
      ...prev,
      isOpen: false,
      epicId: null,
      status: null,
    }));
  }, []);

  const handleCreated = useCallback(
    (task: Task) => {
      setLastCreatedTask(task);
      closeModal();
    },
    [closeModal]
  );

  const value = useMemo(
    () => ({ openCreateTask, lastCreatedTask }),
    [openCreateTask, lastCreatedTask]
  );

  return (
    <CreateTaskModalContext.Provider value={value}>
      {children}
      {modal.isOpen && (
        <CreateTaskModal
          key={modal.nonce}
          projectId={projectId}
          initialEpicId={modal.epicId}
          initialStatus={modal.status}
          onClose={closeModal}
          onCreated={handleCreated}
        />
      )}
    </CreateTaskModalContext.Provider>
  );
}
