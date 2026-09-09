import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 shadow-xs",
  secondary:
    "bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface-secondary hover:border-border-strong disabled:opacity-40 shadow-xs",
  ghost:
    "bg-transparent text-text-primary hover:bg-bg-surface-secondary disabled:opacity-40",
  destructive:
    "bg-danger text-white hover:opacity-90 active:opacity-90 disabled:opacity-50 shadow-xs",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "disabled:cursor-not-allowed",
          // minimum touch target on mobile even if the visual button is smaller
          "min-w-[44px]",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
