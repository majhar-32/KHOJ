import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const fieldBaseClasses = (hasError?: boolean) =>
  [
    "w-full rounded-lg border bg-bg-surface px-3 h-10 text-sm text-text-primary",
    "placeholder:text-text-muted",
    "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors",
    "disabled:bg-bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed",
    hasError ? "border-danger focus:ring-danger focus:border-danger" : "border-border-strong",
  ].join(" ");

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "label"> {
  label?: ReactNode;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <FieldWrapper label={label} error={error} hint={hint} id={id}>
        <div className="relative w-full">
          <input
            ref={ref}
            id={id}
            type={resolvedType}
            className={[
              fieldBaseClasses(!!error),
              isPassword ? "pr-10" : "",
              className,
            ].join(" ")}
            aria-invalid={!!error}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded p-1 transition-colors flex items-center justify-center cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </FieldWrapper>
    );
  }
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
