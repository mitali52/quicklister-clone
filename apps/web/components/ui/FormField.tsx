import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
            'outline-none transition-colors',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
              : 'border-slate-200',
            className,
          )}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? `${inputId}-error` : undefined}
          {...props}
        />
        {error !== undefined && (
          <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
