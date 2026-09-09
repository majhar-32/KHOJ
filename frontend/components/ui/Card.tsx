import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-border-default bg-bg-surface text-text-primary transition-colors",
        padded ? "p-4" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
