'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CalendarDays from '@/src/components/icons/CalendarDays';
import { useEpicMembers } from '@/src/hooks/useEpicMembers';
import { createEpic } from '@/src/lib/api/epics';
import { ApiError } from '@/src/lib/api/members';
import { getSessionToken } from '@/src/lib/api/user';
import {
  epicSchema,
  getToday,
  type EpicFormValues,
} from '@/src/lib/validations/epic';

interface CreateEpicModalProps {
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}

const fieldLabel =
  'mb-1.5 text-[10px] leading-3 font-bold tracking-[0.6px] text-[#737685] uppercase';
const fieldControl =
  'w-full rounded-md border border-[#D7E2FF] bg-white px-3 py-2.5 text-sm leading-5 text-[#041B3C] outline-none placeholder:text-[#9AA0B4] focus:border-[#003D9B] focus:ring-2 focus:ring-[#003D9B]/15';

export function CreateEpicModal({
  projectId,
  onClose,
  onCreated,
}: CreateEpicModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const token = getSessionToken();
  const { members, status: membersStatus } = useEpicMembers(projectId, token);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      assignee_id: '',
      deadline: '',
    },
  });

  const { ref: titleRef, ...titleRegister } = register('title');

  useEffect(() => {
    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    titleInputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function onSubmit(values: EpicFormValues) {
    setApiError(null);
    const session = getSessionToken();
    if (!session) {
      router.replace('/login');
      return;
    }

    try {
      await createEpic(
        {
          title: values.title.trim(),
          project_id: projectId,
          description: values.description?.trim() || undefined,
          assignee_id: values.assignee_id?.trim() || undefined,
          deadline: values.deadline || undefined,
        },
        session,
      );
      toast.success('Epic created');
      onCreated();
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/login');
        return;
      }
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to create epic. Please try again.';
      setApiError(message);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#041B3C66] p-0 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-epic-title"
        className="flex max-h-[min(92dvh,760px)] w-full max-w-[720px] flex-col overflow-hidden rounded-t-xl bg-white shadow-[0px_24px_48px_#041B3C33] sm:rounded-lg"
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
            <h2
              id="create-epic-title"
              className="text-lg leading-7 font-semibold text-[#041B3C] sm:text-xl"
            >
              Add New Epic
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-xl leading-none text-[#737685] hover:bg-[#F1F3FF] sm:hidden"
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid sm:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 sm:pt-5 sm:pb-6">
                <div>
                  <label htmlFor="epic-title" className={fieldLabel}>
                    Title
                  </label>
                  <input
                    id="epic-title"
                    type="text"
                    placeholder="e.g. Dashboard implementation"
                    aria-invalid={Boolean(errors.title)}
                    className={fieldControl}
                    {...titleRegister}
                    ref={(element) => {
                      titleRef(element);
                      titleInputRef.current = element;
                    }}
                  />
                  {errors.title ? (
                    <p role="alert" className="mt-1 text-xs text-[#BA1A1A]">
                      {errors.title.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <label htmlFor="epic-description" className={fieldLabel}>
                    Description
                  </label>
                  <textarea
                    id="epic-description"
                    rows={8}
                    placeholder="Provide detailed context for this epic..."
                    aria-invalid={Boolean(errors.description)}
                    className={`${fieldControl} min-h-[140px] resize-y sm:min-h-[220px]`}
                    {...register('description')}
                  />
                  {errors.description ? (
                    <p role="alert" className="mt-1 text-xs text-[#BA1A1A]">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <aside className="flex flex-col gap-4 border-[#E8ECF8] px-5 pb-4 sm:border-l sm:px-5 sm:py-5">
                <div>
                  <label htmlFor="epic-assignee" className={fieldLabel}>
                    Assignee
                  </label>
                  <select
                    id="epic-assignee"
                    className={`${fieldControl} h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath stroke='%23737685' stroke-width='1.4' d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E")] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-9`}
                    defaultValue=""
                    {...register('assignee_id')}
                  >
                    <option value="">
                      {membersStatus === 'loading'
                        ? 'Loading members...'
                        : 'Select Team Member'}
                    </option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="epic-deadline" className={fieldLabel}>
                    Due date
                  </label>
                  <div className="relative">
                    <input
                      id="epic-deadline"
                      type="date"
                      min={getToday()}
                      aria-invalid={Boolean(errors.deadline)}
                      className={`${fieldControl} h-11 appearance-none pr-9`}
                      {...register('deadline')}
                    />
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2"
                    />
                  </div>
                  {errors.deadline ? (
                    <p role="alert" className="mt-1 text-xs text-[#BA1A1A]">
                      {errors.deadline.message}
                    </p>
                  ) : null}
                </div>
              </aside>
            </div>
          </div>

          {apiError ? (
            <p role="alert" className="px-5 pb-2 text-sm text-[#BA1A1A] sm:px-6">
              {apiError}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-[#E8ECF8] px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="hidden h-10 rounded-md px-4 text-sm font-semibold text-[#434654] hover:bg-[#F1F3FF] sm:inline-flex sm:items-center"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto inline-flex h-12 w-full items-center justify-center rounded-md bg-[#003D9B] px-5 text-sm font-bold text-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)] sm:h-10 sm:w-auto"
            >
              {isSubmitting ? 'Adding...' : 'Add Epic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
