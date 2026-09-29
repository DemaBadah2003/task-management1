'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { createEpic, type CreateEpicPayload } from '@/src/lib/api/epics';
import {
  epicSchema,
  getToday,
  type EpicFormValues,
} from '@/src/lib/validations/epic';
import { useAccessToken } from '@/src/hooks/useAccessToken';
import { useEpicMembers } from '@/src/hooks/useEpicMembers';
import TitleIcon from '@/src/components/icons/Title';

const inputBase =
  'w-full rounded-md border border-transparent bg-[#DDE6FF] px-3 py-2.5 text-sm ' +
  'text-slate-900 outline-none placeholder:text-slate-400 ' +
  'focus:border-blue-700 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60';

const labelBase =
  'text-[11px] font-bold uppercase tracking-wide text-slate-700';

interface CreateEpicFormProps {
  projectId?: string;
}

export default function CreateEpicForm({
  projectId: propProjectId,
}: CreateEpicFormProps) {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = propProjectId || params?.projectId;
  const epicsUrl = `/project/${projectId}/epics`;

  const { token, loading: tokenLoading } = useAccessToken();
  const { members, status, retry } = useEpicMembers(projectId, token);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const submittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      title: '',
      description: '',
      assignee_id: '',
      deadline: '',
    },
  });

  useEffect(() => {
    if (!tokenLoading && !token) router.replace('/login');
  }, [token, tokenLoading, router]);

  const descriptionLength = watch('description')?.length ?? 0;
  const deadlineValue = watch('deadline');

  async function onSubmit(values: EpicFormValues) {
    if (submittingRef.current || !token) return;
    submittingRef.current = true;
    setApiError(null);

    const payload: CreateEpicPayload = {
      title: values.title.trim(),
      project_id: projectId,
    };
    if (values.description?.trim())
      payload.description = values.description.trim();
    if (values.assignee_id) payload.assignee_id = values.assignee_id;
    if (values.deadline) payload.deadline = values.deadline;

    try {
      await createEpic(payload, token);
      toast.success('Epic created successfully');
      router.push(epicsUrl);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      setApiError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
    }
  }

  const assigneePlaceholder =
    status === 'loading'
      ? 'Loading members...'
      : status === 'error'
        ? 'Failed to load members'
        : status === 'empty'
          ? 'No members in this project'
          : 'Select a member...';

  const deadlineRegistration = register('deadline');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="w-full bg-transparent p-0 sm:rounded-xl sm:bg-white sm:p-6 sm:shadow-sm md:p-8"
    >
      {/* ---------- TITLE ---------- */}
      <div className="grid gap-2 md:grid-cols-[160px_1fr] md:gap-6">
        <label htmlFor="title" className={labelBase}>
          Title <span className="text-[#BA1A1A]">*</span>
        </label>
        <div className="min-w-0">
          <input
            id="title"
            type="text"
            placeholder="e.g. Structural Foundation Phase"
            aria-invalid={!!errors.title}
            aria-describedby="title-hint"
            className={inputBase}
            {...register('title')}
          />
          {errors.title ? (
            <p
              id="title-hint"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-[16.5px] font-medium tracking-[0.55px] text-[#BA1A1A] uppercase"
            >
              <TitleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.title.message}</span>
            </p>
          ) : (
            <p id="title-hint" className="mt-1.5 text-[11px] text-slate-400">
              Minimum 3 characters required.
            </p>
          )}
        </div>
      </div>

      {/* ---------- DESCRIPTION ---------- */}
      <div className="mt-6 grid gap-2 md:grid-cols-[160px_1fr] md:gap-6">
        <label htmlFor="description" className={labelBase}>
          Description
          <span className="block text-[10px] font-normal text-slate-400 normal-case">
            Optional
          </span>
        </label>
        <div className="min-w-0">
          <textarea
            id="description"
            rows={5}
            maxLength={500}
            placeholder="Describe the scope and objectives of this epic..."
            className={`${inputBase} resize-none`}
            {...register('description')}
          />
          <p className="mt-1 text-right text-[10px] text-slate-400">
            {descriptionLength} / 500 characters
          </p>
        </div>
      </div>

      {/* ---------- ASSIGNEE + DEADLINE ---------- */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="assignee" className={`${labelBase} mb-2 block`}>
            Assignee
          </label>
          <select
            id="assignee"
            disabled={
              status === 'loading' || status === 'error' || status === 'empty'
            }
            className={inputBase}
            {...register('assignee_id')}
          >
            <option value="">{assigneePlaceholder}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.email ? ` (${m.email})` : ''}
              </option>
            ))}
          </select>

          {status === 'error' && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-[16.5px] font-medium tracking-[0.55px] text-[#BA1A1A] uppercase">
              <TitleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                Couldn&apos;t load members.{' '}
                <button
                  type="button"
                  onClick={retry}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </span>
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label htmlFor="deadline" className={`${labelBase} mb-2 block`}>
            Deadline
          </label>
          <input
            id="deadline"
            type={isDateFocused || deadlineValue ? 'date' : 'text'}
            placeholder="mm/dd/yyyy"
            min={getToday()}
            onFocus={() => setIsDateFocused(true)}
            {...deadlineRegistration}
            onBlur={(e) => {
              deadlineRegistration.onBlur(e);
              if (!e.target.value) setIsDateFocused(false);
            }}
            className={inputBase}
          />
          {errors.deadline && (
            <p
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-[16.5px] font-medium tracking-[0.55px] text-[#BA1A1A] uppercase"
            >
              <TitleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.deadline.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* ---------- API ERROR ---------- */}
      {apiError && (
        <div
          role="alert"
          className="mt-6 flex items-center gap-2 text-[11px] leading-[16.5px] font-medium tracking-[0.55px] text-[#BA1A1A] uppercase"
        >
          <TitleIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* ---------- ACTIONS ---------- */}
      <div className="mt-10 flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-start md:gap-4">
        <button
          type="submit"
          disabled={isSubmitting || tokenLoading}
          style={{
            backgroundColor: '#0052CC',
            boxShadow:
              '0px 4px 6px -4px #003D9B33, 0px 10px 15px -3px #003D9B33',
          }}
          className="w-full rounded-md px-6 py-3 text-center text-[14px] leading-[20px] font-bold text-white transition hover:bg-[#0043A8] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {isSubmitting ? 'Creating...' : 'Create Epic'}
        </button>

        <button
          type="button"
          onClick={() => router.push(epicsUrl)}
          disabled={isSubmitting}
          className="w-full text-center text-[16px] leading-[24px] font-medium text-[#4F5F7B] transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
