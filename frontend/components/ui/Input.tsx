import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from "react";

interface FieldWrapperProps {
  label?: ReactNode;
  error?: string;
  hint?: string;
  id?: string;
  children: ReactNode;
}

function FieldWrapper({ label, error, hint, id, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-error-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-600 dark:text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

const fieldBaseClasses = (hasError?: boolean) =>
  [
    "w-full rounded-lg border bg-white dark:bg-neutral-800 px-3 h-10 text-sm text-neutral-900 dark:text-white",
    "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
    "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600",
    "disabled:bg-neutral-100 dark:disabled:bg-neutral-900/60 disabled:text-neutral-400 dark:disabled:text-neutral-500 disabled:cursor-not-allowed",
    hasError ? "border-error-500" : "border-neutral-300 dark:border-neutral-700",
  ].join(" ");

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "label"> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <input
        ref={ref}
        id={id}
        className={[fieldBaseClasses(!!error), className].join(" ")}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  )
);
Input.displayName = "Input";

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "label"> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = "", rows = 4, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={[fieldBaseClasses(!!error), "h-auto py-2 resize-y", className].join(" ")}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrapper>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "label"> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className = "", children, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      <select
        ref={ref}
        id={id}
        className={[fieldBaseClasses(!!error), "appearance-none pr-8", className].join(" ")}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = "Select";
