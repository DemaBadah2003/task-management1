'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  editProjectSchema,
  type EditProjectFormValues,
} from '@/src/lib/validations/project-schema';
import { getProjectByIdApi, updateProjectApi } from '@/src/lib/api/project';
import { cn } from '@/src/lib/utils';
import { useActiveProject } from '@/src/context/project-context';

interface EditProjectFormProps {
  projectId?: string;
  initialData?: {
    id?: string;
    name?: string;
    title?: string;
    description?: string;
  };
}

export function EditProjectForm({ projectId, initialData }: EditProjectFormProps) {
  const router = useRouter();
  const { setActiveProject } = useActiveProject();

  const targetProjectId = projectId || initialData?.id;

  const [isLoadingProject, setIsLoadingProject] = useState(Boolean(targetProjectId && !initialData?.name && !initialData?.title));
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    mode: 'onTouched',
    defaultValues: {
      name: initialData?.name || initialData?.title || '',
      description: initialData?.description || '',
    },
  });

  const fetchProjectDetails = useCallback(async () => {
    if (!targetProjectId) return;

    setIsLoadingProject(true);
    setFetchError(null);

    try {
      const project = await getProjectByIdApi(targetProjectId);
      reset({
        name: project.name,
        description: project.description || '',
      });
      setActiveProject(project);
    } catch (err: unknown) {
      console.error('Failed to fetch project for editing:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load project details';
      setFetchError(msg);
    } finally {
      setIsLoadingProject(false);
    }
  }, [targetProjectId, reset, setActiveProject]);

  useEffect(() => {
    if (targetProjectId) {
      fetchProjectDetails();
    }
  }, [targetProjectId, fetchProjectDetails]);

  const descriptionValue = watch('description') || '';

  async function onSubmit(values: EditProjectFormValues) {
    if (!targetProjectId) {
      setApiError('Project ID is missing.');
      return;
    }

    setApiError(null);
    try {
      await updateProjectApi({
        id: targetProjectId,
        name: values.name,
        description: values.description,
      });

      // Update active project context
      setActiveProject({
        id: targetProjectId,
        name: values.name,
        description: values.description || '',
        createdAt: new Date().toISOString(),
      });

      toast.success('Project updated successfully');
      router.push('/project');
    } catch (err: unknown) {
      console.error('Update project error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update project';
      setApiError(`Failed to update project: ${msg}`);
    }
  }

  function handleCancel() {
    router.push('/project');
  }

  // 1. Loading Skeleton View
  if (isLoadingProject) {
    return (
      <div className="mx-auto flex w-full max-w-[342px] flex-col gap-6 sm:max-w-[672px] sm:overflow-hidden sm:rounded-[8px] sm:border sm:border-[#E8EDFF] sm:bg-white sm:p-[48px]">
        <div className="flex animate-pulse items-center gap-3.5">
          <div className="hidden h-[44px] w-[46px] rounded bg-[#D7E2FF]/60 sm:block" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 rounded bg-[#D7E2FF]/60" />
            <div className="h-4 w-64 rounded bg-[#D7E2FF]/40" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded bg-[#D7E2FF]/40" />
            <div className="h-12 w-full rounded bg-[#D7E2FF]/50" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded bg-[#D7E2FF]/40" />
            <div className="h-28 w-full rounded bg-[#D7E2FF]/50" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch Error View
  if (fetchError) {
    return (
      <div className="mx-auto flex w-full max-w-[342px] flex-col items-center gap-4 rounded-[8px] border border-[#FFDAD6] bg-[#FFF8F7] p-6 text-center sm:max-w-[672px] sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-bold text-[#041B3C]">Failed to Load Project</h3>
          <p className="text-[14px] text-[#4F5F7B]">{fetchError}</p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProjectDetails}
            className="rounded-[4px] bg-[#003D9B] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#002B70]"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-[4px] border border-[#E8EDFF] bg-white px-4 py-2 text-[14px] font-semibold text-[#4F5F7B] hover:bg-[#F1F3FF]"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // 3. Edit Form View
  return (
    <div className="mx-auto flex w-full max-w-[342px] flex-col gap-6 sm:max-w-[672px] sm:gap-0 sm:overflow-hidden sm:rounded-[8px] sm:border sm:border-[#E8EDFF] sm:bg-white sm:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Form Content Area */}
      <div className="flex flex-col gap-6 sm:px-[56px] sm:py-[48px]">
        {/* Card Header */}
        <div className="flex items-center gap-3.5">
          <Image
            src="/icons/Overlay.svg"
            alt="Edit Project"
            width={46}
            height={44}
            className="hidden h-[44px] w-[46px] shrink-0 sm:block"
            priority
          />
          <div className="flex flex-col">
            <h2 className="text-[24px] leading-[32px] font-semibold tracking-[0px] text-[#041B3C]">
              Edit Project
            </h2>
            <p className="mt-0.5 text-[14px] leading-[20px] font-normal tracking-[0px] text-[#4F5F7B]">
              Update the name and description for this project.
            </p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Project Name Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#4F5F7B] uppercase"
            >
              PROJECT NAME <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter project name..."
              aria-invalid={Boolean(errors.name)}
              className={cn(
                'w-full rounded-[8px] bg-[#D7E2FF] p-4 sm:rounded-[4px] sm:px-[16px] sm:py-[12px]',
                'text-[16px] leading-[24px] font-normal text-[#041B3C]',
                'border-none outline-none placeholder:text-[#4F5F7B80]',
                errors.name && 'ring-2 ring-[#BA1A1A]'
              )}
              {...register('name')}
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-[18px] font-medium text-[#BA1A1A]">
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#4F5F7B] uppercase"
            >
              DESCRIPTION
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide a high-level overview of the project's objectives..."
              aria-invalid={Boolean(errors.description)}
              className={cn(
                'w-full rounded-[8px] bg-[#D7E2FF] px-4 pt-4 pb-[88px] sm:rounded-[4px] sm:px-[16px] sm:pt-[12px] sm:pb-[84px]',
                'text-[16px] leading-[24px] font-normal text-[#041B3C]',
                'resize-none border-none outline-none placeholder:text-[#4F5F7B80]',
                errors.description && 'ring-2 ring-[#BA1A1A]'
              )}
              {...register('description')}
            />
            {/* Character counter */}
            <div className="mt-0.5 flex items-center justify-between">
              {errors.description ? (
                <div className="flex items-center gap-1.5 text-[12px] leading-[18px] font-medium text-[#BA1A1A]">
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{errors.description.message}</span>
                </div>
              ) : (
                <div />
              )}
              <span className="text-[11px] leading-[16.5px] font-medium tracking-[0px] text-[#4F5F7B]">
                {descriptionValue.length} / 500
                <span className="hidden sm:inline"> characters</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'order-1 inline-flex h-[56px] w-full items-center justify-center rounded-[8px] bg-[#003D9B] px-6 py-2.5 sm:order-2 sm:h-[44px] sm:w-auto sm:min-w-[160px] sm:rounded-[4px]',
                'text-center text-[16px] leading-[24px] font-bold tracking-[0px] text-white sm:text-[14px] sm:leading-[20px]',
                'shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_-3px_rgba(0,0,0,0.1)] sm:shadow-[0px_4px_6px_-4px_rgba(0,61,155,0.2),0px_10px_15px_-3px_rgba(0,61,155,0.2)]',
                'transition-all hover:bg-[#002B70] active:scale-[0.99]',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="order-2 w-full py-2 text-center text-[16px] leading-[24px] font-medium tracking-[0px] text-[#003D9B] transition-colors hover:text-[#041B3C] focus:outline-none sm:order-1 sm:w-auto sm:py-0 sm:text-[14px] sm:leading-[20px] sm:font-bold sm:text-[#4F5F7B]"
            >
              Cancel
            </button>
          </div>

          {/* Form-level API Error message */}
          {apiError && (
            <p
              role="alert"
              className="mt-2 text-center text-[13px] font-medium text-[#BA1A1A]"
            >
              {apiError}
            </p>
          )}
        </form>

        {/* Mobile Pro Tip Card */}
        <div className="mt-2 flex w-full flex-col gap-1 rounded-[8px] bg-[#F1F3FF] p-[24px] text-left sm:hidden">
          <span className="text-[12px] leading-[19.5px] font-bold text-[#4F5F7B]">
            Pro Tip
          </span>
          <p className="text-[12px] leading-[18px] font-normal text-[#4F5F7B]">
            You can invite project members and assign epics immediately after
            updating project details.
          </p>
        </div>
      </div>

      {/* Desktop Pro Tip Footer Section */}
      <div className="hidden w-full items-center gap-3 border-t border-[#E8EDFF] bg-[#F1F3FF] p-[24px] sm:flex">
        <Image
          src="/icons/lamp.svg"
          alt="Pro Tip"
          width={16}
          height={16}
          className="h-4 w-4 shrink-0"
        />
        <p className="text-[12px] leading-[19.5px] text-[#041B3C]">
          <span className="font-bold text-[#4F5F7B]">Pro Tip: </span>
          <span className="font-normal text-[#4F5F7B]">
            You can invite project members and assign epics immediately after
            updating project details.
          </span>
        </p>
      </div>
    </div>
  );
}
