import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-neutral-300/70 bg-white",
        padded ? "p-4" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
