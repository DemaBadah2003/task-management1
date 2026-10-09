'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import useTaskFormEpics from '@/src/hooks/useTaskFormEpics';
import useTaskFormMembers from '@/src/hooks/useTaskFormMembers';
import { createTask } from '@/src/lib/tasks-api';
import { truncate } from '@/src/lib/format';
import {
  DEFAULT_TASK_STATUS,
  TASK_STATUSES,
  formatStatusLabel,
} from '@/src/constants/task-statuses';
import type { CreateTaskPayload, Task, TaskStatus } from '@/src/types/task';

interface CreateTaskModalProps {
  projectId: string;
  initialEpicId: string | null;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

const labelClass =
  'mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-slate-500';
const controlClass =
  'h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60';

export default function CreateTaskModal({
  projectId,
  initialEpicId,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const { token: accessToken } = useAccessToken();
  const epicsState = useTaskFormEpics(projectId);
  const membersState = useTaskFormMembers(projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_TASK_STATUS);
  const [assigneeId, setAssigneeId] = useState('');
  const [epicId, setEpicId] = useState(initialEpicId ?? '');
  const [dueDate, setDueDate] = useState('');

  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escape للإغلاق + قفل scroll الصفحة
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return; // منع التكرار

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    if (!accessToken) {
      setSubmitError('Your session has expired. Please log in again.');
      return;
    }

    // نبني الجسم بدون حقول فارغة
    const payload: CreateTaskPayload = {
      project_id: projectId,
      title: title.trim(),
      status,
    };
    if (description.trim()) payload.description = description.trim();
    if (epicId) payload.epic_id = epicId;
    if (assigneeId) payload.assignee_id = assigneeId;
    if (dueDate) {
      // مثال: 2026-10-03T14:30:00Z
      payload.due_date = new Date(dueDate)
        .toISOString()
        .replace(/\.\d{3}Z$/, 'Z');
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const task = await createTask(accessToken, payload);
      onCreated(task); // الإغلاق يتم فقط بعد النجاح
    } catch (err) {
      // نبقي الـ popup مفتوحاً مع القيم
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      setIsSubmitting(false);
    }
  }

  const epicMissingFromList =
    epicId && !epicsState.epics.some((epic) => epic.id === epicId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm md:items-center md:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-h-[85vh] md:max-w-4xl md:rounded-xl"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[1fr_280px] md:overflow-hidden">
          {/* ===== العمود الأيسر: Title + Description ===== */}
          <div className="flex flex-col gap-4 p-5 md:overflow-y-auto md:p-6">
            <div className="flex items-center justify-between">
              <h2
                id="create-task-title"
                className="text-base font-bold text-slate-900"
              >
                Add New Task
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="text-xl leading-none text-slate-500 md:hidden"
              >
                ×
              </button>
            </div>

            <div>
              <label htmlFor="task-title" className={labelClass}>
                Title
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                placeholder="e.g., Finalize structural schematics"
                aria-invalid={!!titleError}
                className={controlClass}
              />
              {titleError && (
                <p className="mt-1 text-[11px] text-red-600">{titleError}</p>
              )}
            </div>

            <div className="flex flex-1 flex-col">
              <label htmlFor="task-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed context for this task..."
                className="min-h-[140px] w-full flex-1 resize-none rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 md:min-h-[320px]"
              />
            </div>
          </div>

          {/* ===== العمود الأيمن: Status / Assignee / Epic / Due Date ===== */}
          <aside className="flex flex-col gap-4 bg-slate-50 p-5 md:overflow-y-auto md:p-6">
            <div>
              <label htmlFor="task-status" className={labelClass}>
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={controlClass}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {formatStatusLabel(s.key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee" className={labelClass}>
                Assignee {membersState.isLoading && '(loading...)'}
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={controlClass}
              >
                <option value="">Select Team Member</option>
                {membersState.members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.full_name ?? m.email ?? m.user_id}
                  </option>
                ))}
              </select>
              {membersState.error && (
                <p className="mt-1 text-[11px] text-red-600">
                  Couldn&apos;t load members: {membersState.error}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="task-epic" className={labelClass}>
                Epic {epicsState.isLoading && '(loading...)'}
              </label>
              <select
                id="task-epic"
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className={controlClass}
              >
                {/* الخيار الفارغ يسمح بإزالة الـ Epic */}
                <option value="">Select Epic</option>
                {/* يبقي الـ Epic المحدد ظاهراً حتى ينتهي التحميل */}
                {epicMissingFromList && (
                  <option value={epicId}>{epicId}</option>
                )}
                {epicsState.epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.id} {truncate(epic.title, 100)}
                  </option>
                ))}
              </select>
              {epicsState.error && (
                <p className="mt-1 text-[11px] text-red-600">
                  Couldn&apos;t load epics: {epicsState.error}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="task-due-date" className={labelClass}>
                Due Date
              </label>
              <input
                id="task-due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={controlClass}
              />
            </div>
          </aside>
        </div>

        {/* ===== Footer ===== */}
        <footer className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          {submitError && (
            <p
              role="alert"
              className="text-[11px] text-red-600 md:order-2 md:mx-4 md:flex-1 md:text-right"
            >
              {submitError}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="hidden h-8 items-center rounded bg-blue-50 px-4 text-[11px] font-bold text-blue-900 disabled:opacity-60 md:order-1 md:inline-flex"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full rounded bg-blue-900 px-5 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 md:order-3 md:w-auto"
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </footer>
      </form>
    </div>
  );
}
