import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { EventStatus } from "@/lib/types";

type BadgeTone = "primary" | "success" | "warning" | "error" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-green-700",
  warning: "bg-warning-50 text-amber-700",
  error: "bg-error-50 text-red-700",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function CategoryTag({ label }: { label: string }) {
  return (
    <span className={["inline-block rounded-md px-2 py-0.5 text-xs font-medium", toneClasses.primary].join(" ")}>
      {label}
    </span>
  );
}

export function DeadlineBadge({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 7;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        urgent ? toneClasses.warning : toneClasses.neutral,
      ].join(" ")}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      {daysLeft <= 0
        ? "Deadline passed"
        : daysLeft === 1
        ? "Deadline: tomorrow"
        : `Deadline in ${daysLeft} days`}
    </span>
  );
}

const statusConfig: Record<
  EventStatus,
  { label: string; tone: BadgeTone; icon: typeof CheckCircle2 }
> = {
  approved: { label: "Approved", tone: "success", icon: CheckCircle2 },
  pending: { label: "Pending Review", tone: "warning", icon: AlertCircle },
  rejected: { label: "Rejected", tone: "error", icon: XCircle },
};

export function StatusChip({ status }: { status: EventStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        toneClasses[config.tone],
      ].join(" ")}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
