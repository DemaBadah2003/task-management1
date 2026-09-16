'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '@/src/lib/validations/project-schema';
import { updateProjectApi } from '@/src/lib/api/project';
import { cn } from '@/src/lib/utils';

interface EditProjectFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
  };
}

export function EditProjectForm({ initialData }: EditProjectFormProps) {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onTouched',
    defaultValues: {
      title: initialData?.title || 'Tasks Management project',
      description:
        initialData?.description ||
        "Provide a high-level overview of the project's architectural objectives and key milestones...",
    },
  });

  const descriptionValue = watch('description') || '';

  async function onSubmit(values: CreateProjectFormValues) {
    setApiError(null);
    try {
      await updateProjectApi({
        id: initialData?.id,
        name: values.title,
        description: values.description,
      });

      toast.success('Project updated successfully');
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed To Update Project, Try Again Later';
      setApiError(errorMsg);
      toast.error(errorMsg);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[342px] sm:max-w-[672px] flex-col gap-6 sm:gap-0 sm:overflow-hidden sm:rounded-[8px] sm:border sm:border-[#E8EDFF] sm:bg-white sm:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Form Content Area: No card padding on mobile, 56px inset padding on desktop */}
      <div className="flex flex-col gap-6 sm:px-[56px] sm:py-[48px]">
        {/* Card Header: Icon hidden on mobile, visible on sm+ */}
        <div className="flex items-center gap-3.5">
          <Image
            src="/icons/Overlay.svg"
            alt="Edit Project"
            width={46}
            height={44}
            className="hidden sm:block h-[44px] w-[46px] shrink-0"
            priority
          />
          <div className="flex flex-col">
            <h2 className="text-[24px] font-semibold leading-[32px] tracking-[0px] text-[#041B3C]">
              Edit Project
            </h2>
            <p className="mt-0.5 text-[14px] font-normal leading-[20px] tracking-[0px] text-[#4F5F7B]">
              Define the scope and foundational details of your project.
            </p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Top Form-level API Error message */}
          {apiError && (
            <div
              role="alert"
              className="rounded-[8px] sm:rounded-[4px] border border-[#BA1A1A]/30 bg-[#FFDAD6]/50 p-3.5 text-[13px] font-medium text-[#BA1A1A]"
            >
              {apiError}
            </div>
          )}

          {/* Project Title Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-[11px] font-bold leading-[16.5px] tracking-[0.55px] uppercase text-[#4F5F7B]"
            >
              PROJECT TITLE <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter project title..."
              aria-invalid={Boolean(errors.title)}
              className={cn(
                'w-full rounded-[8px] sm:rounded-[4px] bg-[#D7E2FF] p-4 sm:py-[12px] sm:px-[16px]',
                'text-[16px] font-normal leading-[24px] text-[#041B3C]',
                'placeholder:text-[#4F5F7B80] border-none outline-none'
              )}
              {...register('title')}
            />
            {errors.title && (
              <div className="mt-1 flex items-center gap-1.5 text-[12px] font-medium leading-[18px] text-[#BA1A1A]">
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
                <span>{errors.title.message}</span>
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-[11px] font-bold leading-[16.5px] tracking-[0.55px] uppercase text-[#4F5F7B]"
            >
              DESCRIPTION
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide a high-level overview of the project's architectural objectives and key milestones..."
              aria-invalid={Boolean(errors.description)}
              className={cn(
                'w-full rounded-[8px] sm:rounded-[4px] bg-[#D7E2FF] pt-4 px-4 pb-[88px] sm:pt-[12px] sm:px-[16px] sm:pb-[84px]',
                'text-[16px] font-normal leading-[24px] text-[#041B3C]',
                'placeholder:text-[#4F5F7B80] border-none outline-none resize-none'
              )}
              {...register('description')}
            />
            {/* Character counter */}
            <div className="flex items-center justify-between mt-0.5">
              {errors.description ? (
                <div className="flex items-center gap-1.5 text-[12px] font-medium leading-[18px] text-[#BA1A1A]">
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
              ) : <div />}
              <span className="text-[11px] font-medium leading-[16.5px] tracking-[0px] text-[#4F5F7B]">
                {descriptionValue.length} / 500<span className="hidden sm:inline"> characters</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'order-1 sm:order-2 inline-flex h-[56px] sm:h-[44px] w-full sm:w-auto sm:min-w-[160px] items-center justify-center rounded-[8px] sm:rounded-[4px] bg-[#003D9B] px-6 py-2.5',
                'text-[16px] sm:text-[14px] font-bold leading-[24px] sm:leading-[20px] tracking-[0px] text-white text-center',
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
                'Save Changes'
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/project')}
              className="order-2 sm:order-1 text-center w-full sm:w-auto text-[16px] sm:text-[14px] font-medium sm:font-bold leading-[24px] sm:leading-[20px] tracking-[0px] text-[#003D9B] sm:text-[#4F5F7B] transition-colors hover:text-[#041B3C] focus:outline-none py-2 sm:py-0"
            >
              Back
            </button>
          </div>
        </form>

        {/* Mobile Pro Tip Standalone Card sitting on page background (Fill 342px x Hug 106px, Radius 8px, Padding 24px, #F1F3FF, NO Icon) */}
        <div className="flex sm:hidden flex-col gap-1 text-left w-full rounded-[8px] bg-[#F1F3FF] p-[24px] mt-2">
          <span className="text-[12px] font-bold leading-[19.5px] text-[#4F5F7B]">
            Pro Tip
          </span>
          <p className="text-[12px] font-normal leading-[18px] text-[#4F5F7B]">
            You can invite project members and assign epics immediately after the initial creation process.
          </p>
        </div>
      </div>

      {/* Desktop Pro Tip Footer Section */}
      <div className="hidden sm:flex w-full items-center gap-3 bg-[#F1F3FF] p-[24px] border-t border-[#E8EDFF]">
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
            You can invite project members and assign epics immediately after the initial creation process.
          </span>
        </p>
      </div>
    </div>
  );
}
