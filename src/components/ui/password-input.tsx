'use client';

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showToggleIcon?: boolean;
  labelAction?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      id,
      name,
      className,
      showToggleIcon = true,
      labelAction,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? name;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-slate-600 uppercase"
          >
            {label}
          </label>
          {labelAction}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'bg-input-bg w-full rounded-lg px-4 py-3.5 sm:px-[16px] sm:py-[14px]',
              showToggleIcon && 'pr-11',
              'placeholder:text-placeholder text-[16px] font-normal text-slate-900 transition-all outline-none',
              'focus:bg-checklist-bg focus:ring-primary/30 focus:ring-2',
              error &&
                'border-error bg-error-bg text-error placeholder:text-error/60 focus:ring-error/20 border',
              className
            )}
            {...props}
          />

          {showToggleIcon && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center focus:outline-none"
            >
              {visible ? (
                <svg
                  width="22"
                  height="15"
                  viewBox="0 0 22 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[15px] w-[22px]"
                >
                  <path
                    d="M11 12C12.25 12 13.3125 11.5625 14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12ZM11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2ZM11 15C8.56667 15 6.35 14.3208 4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15ZM11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13Z"
                    fill="#041B3C"
                  />
                  <line
                    x1="2"
                    y1="1"
                    x2="20"
                    y2="14"
                    stroke="#041B3C"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <Image
                  src="/icons/eye.svg"
                  alt="Toggle Password"
                  width={22}
                  height={15}
                  className="h-[15px] w-[22px] opacity-80 hover:opacity-100"
                />
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-error text-[12px] font-medium"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
