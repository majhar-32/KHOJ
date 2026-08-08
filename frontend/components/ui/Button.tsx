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
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700 disabled:bg-primary-600/40",
  secondary:
    "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40",
  ghost:
    "bg-transparent text-neutral-900 hover:bg-neutral-100 disabled:opacity-40",
  destructive:
    "bg-error-500 text-white hover:bg-red-600 disabled:bg-error-500/40",
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
