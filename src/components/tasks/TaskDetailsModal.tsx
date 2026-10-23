'use client';

import TaskDetailsContent from './task-details/TaskDetailsContent';
import TaskDetailsError from './task-details/TaskDetailsError';
import TaskDetailsFooter from './task-details/TaskDetailsFooter';
import TaskDetailsHeader from './task-details/TaskDetailsHeader';
import TaskDetailsLoading from './task-details/TaskDetailsLoading';
import TaskDetailsSidebar from './task-details/TaskDetailsSidebar';
import type { TaskDetailsModalProps } from './task-details/types';
import { useModalA11y } from './task-details/useModal';
import { useTaskDetails } from './task-details/useTaskDetails';

export default function TaskDetailsModal({
  projectId,
  taskId,
  assignee,
  projectMembers,
  projectEpics,
  epic,
  onClose,
}: TaskDetailsModalProps) {
  const { closeButtonRef, desktopCloseButtonRef, dialogRef } =
    useModalA11y(onClose);
  const { currentState, retry } = useTaskDetails(projectId, taskId);
  const task = currentState.status === 'success' ? currentState.task : null;

  return (
    <div
      data-task-details-modal
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#041B3C66] p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="relative flex h-dvh w-full max-w-[946px] flex-col gap-2.5 overflow-hidden rounded-t-[32px] bg-[#F1F3FF] px-6 pt-8 pb-8 shadow-[0px_24px_48px_#041B3C33] md:h-[min(900px,calc(100dvh-16px))] md:gap-0 md:rounded-md md:bg-white md:p-0"
      >
        <TaskDetailsHeader
          task={task}
          closeButtonRef={closeButtonRef}
          onClose={onClose}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-0">
          {currentState.status === 'loading' ? (
            <TaskDetailsLoading />
          ) : currentState.status === 'success' ? (
            <>
              <TaskDetailsContent task={currentState.task} />
              <TaskDetailsSidebar
                task={currentState.task}
                assignee={assignee}
                projectMembers={projectMembers}
                projectEpics={projectEpics}
                epic={epic}
              />
            </>
          ) : (
            <TaskDetailsError status={currentState.status} onRetry={retry} />
          )}
        </div>

        <TaskDetailsFooter
          closeButtonRef={desktopCloseButtonRef}
          onClose={onClose}
        />
      </section>
    </div>
  );
}
