import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  optional?: boolean;
  labelAction?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      optional,
      labelAction,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? props.name;
    const describedBy = error
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-helper`
        : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-slate-600 uppercase"
          >
            {label}
            {optional && (
              <span className="font-normal text-slate-300 normal-case">
                {' '}
                (optional)
              </span>
            )}
          </label>
          {labelAction}
        </div>

        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'bg-input-bg w-full rounded-lg px-4 py-3.5 sm:px-[16px] sm:py-[14px]',
            'placeholder:text-placeholder text-[16px] font-normal text-slate-900 transition-all outline-none',
            'focus:bg-checklist-bg focus:ring-primary/30 focus:ring-2',
            error &&
              'border-error bg-error-bg text-error placeholder:text-error/60 focus:ring-error/20 border',
            className
          )}
          {...props}
        />

        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-error text-[12px] font-medium"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-[11px] text-slate-300">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
